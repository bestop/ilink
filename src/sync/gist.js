/**
 * iLink 云端同步 —— GitHub Gist 存储适配层
 *
 * 设计说明：
 * - 配置数据保存在用户自己 GitHub 账号下的"私密 Gist"中，iLink 不经过任何第三方服务器；
 * - 选择 Gist 作为首个后端的原因：零基础设施、无需注册额外服务、
 *   令牌权限可收敛到仅 Gists 读写（无仓库权限，泄露影响面小）；
 * - 如需接入 Supabase 等其他存储，只需实现同样的三个接口：
 *   createConfigGist(创建存储) / fetchConfig(拉取) / updateConfig(上传)，
 *   并保持 buildPayload/parsePayload 的载荷格式即可无缝替换。
 */

const GIST_FILENAME = 'ilink-config.json';
const GIST_DESCRIPTION = 'iLink 导航配置云端同步（由 iLink 自动管理，请勿手工编辑）';
const SCHEMA_VERSION = 1;

/**
 * 构造云端存储的完整载荷：box 外包一层元信息，用于多设备冲突判断
 */
export const buildPayload = (box, deviceName) => ({
  app: 'ilink',
  schema: SCHEMA_VERSION,
  updatedAt: Date.now(),
  device: deviceName || '未知设备',
  box: JSON.parse(JSON.stringify(box)),
});

/**
 * 校验云端载荷并返回；格式不符时抛出可读错误
 */
export const parsePayload = (content) => {
  if (!content) throw new Error('云端配置为空');
  let payload;
  try {
    payload = JSON.parse(content);
  } catch (e) {
    throw new Error('云端配置不是合法的 JSON');
  }
  if (!payload || payload.app !== 'ilink' || !Array.isArray(payload.box)) {
    throw new Error('云端配置格式不正确（缺少 ilink 载荷标识）');
  }
  return payload;
};

/**
 * 把 HTTP 状态码翻译成可操作的中文提示
 */
const explainHttpError = (status) => {
  if (status === 401) return '令牌无效或已过期（401），请重新生成';
  if (status === 403) return '令牌缺少 Gists 读写权限，或已触发 GitHub 限流（403）';
  if (status === 404) return '未找到该 Gist（404），请检查 Gist ID 是否正确';
  if (status === 422) return 'GitHub 拒绝了请求（422），请检查参数';
  return `GitHub 接口返回 ${status}`;
};

/**
 * 统一的请求封装：非 2xx 抛出中文错误
 */
const gistRequest = async (token, path, options = {}) => {
  let res;
  try {
    res = await fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.body ? {'Content-Type': 'application/json'} : {}),
      },
    });
  } catch (e) {
    throw new Error('网络请求失败，请检查网络连接后重试');
  }
  if (!res.ok) throw new Error(explainHttpError(res.status));
  return res.json();
};

/**
 * 创建私密 Gist 并写入当前配置，返回 gist id（首次连接且未填 Gist ID 时调用）
 */
export const createConfigGist = async (token, box, deviceName) => {
  const body = {
    description: GIST_DESCRIPTION,
    public: false,
    files: {
      [GIST_FILENAME]: {content: JSON.stringify(buildPayload(box, deviceName), null, 2)},
    },
  };
  const gist = await gistRequest(token, '/gists', {method: 'POST', body: JSON.stringify(body)});
  if (!gist || !gist.id) throw new Error('创建 Gist 失败（返回数据缺少 id）');
  return gist.id;
};

/**
 * 拉取云端配置：返回 { payload, gistHtmlUrl }；Gist 中还没有配置文件时 payload 为 null
 */
export const fetchConfig = async (token, gistId) => {
  const gist = await gistRequest(token, `/gists/${gistId}`);
  const file = gist.files && gist.files[GIST_FILENAME];
  return {
    payload: file && file.content ? parsePayload(file.content) : null,
    gistHtmlUrl: gist.html_url || '',
  };
};

/**
 * 上传配置（整体覆盖云端同名文件）
 */
export const updateConfig = async (token, gistId, box, deviceName) => {
  const body = {
    files: {
      [GIST_FILENAME]: {content: JSON.stringify(buildPayload(box, deviceName), null, 2)},
    },
  };
  await gistRequest(token, `/gists/${gistId}`, {method: 'PATCH', body: JSON.stringify(body)});
};
