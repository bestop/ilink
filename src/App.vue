<template>
  <!-- 右下角按钮 -->
  <a-trigger
      :trigger="['click', 'hover']"
      clickToClose
      position="top"
      v-model:popupVisible="cornerMenuPopupVisible"
  >
    <div
        :class="`button-trigger ${cornerMenuPopupVisible ? 'button-trigger-active' : ''} ${controlEditable ? 'button-trigger-settings' : ''}`">
      <IconClose v-if="cornerMenuPopupVisible"/>
      <IconApps v-else/>
    </div>
    <template #content>
      <a-menu
          :style="{ marginBottom: '-4px' }"
          mode="popButton"
          :tooltipProps="{ position: 'left' }"
          showCollapseButton
          @menu-item-click="cornerMenuClick"
      >
        <a-menu-item key="1">
          <template #icon>
            <IconGithub></IconGithub>
          </template>
          Github开源主页
        </a-menu-item>
        <a-menu-item key="2">
          <template #icon>
            <IconSettings></IconSettings>
          </template>
          设置导航
        </a-menu-item>
        <a-menu-item key="3">
          <template #icon>
            <IconMoon v-if="!isDarkTheme"/>
            <IconSun v-else/>
          </template>
          {{ isDarkTheme ? '浅色模式' : '深色模式' }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-trigger>

  <!-- 下面是整个导航部分 -->
  <a-layout>
    <a-layout>
      <a-layout-content id="main-content">

        <!-- 搜索功能 -->
        <div class="page-shell">
          <div>
            <a-space direction="vertical" size="large" style="width: 100%;">
              <a-input-search :style="{width: '100%'}"
                              placeholder="输入关键词后，点击下方的搜索网站，直接会跳转到新标签页搜索"
                              v-model="keywords"/>
            </a-space>

            <div class="search-panel">
              <div v-for="line in searchToolbox" :key="line.name">
                <div :class="{'search-line': true, 'no-visible': line.collapsed}">
                  <div class="search-line-title"><span class="nowrap">{{ line.name }}</span></div>
                  <ul class="search-line-ul">
                    <li class="search-line-li" v-for="site in line.sites" :key="site.name + site.src">
                      <a class="search-line-li-a cursor-pointer" @click.left="goToSearch(site.src)"
                         @click.middle="goToSearch(site.src)">
                        <img class="search-line-li-a-img" alt=""
                             :key="site.src"
                             :data-host="getUrlHost(site.src)"
                             decoding="async"
                             @vue:mounted="onFaviconMount"
                             @load="onFaviconLoad"
                             @error="onFaviconError">
                        <span class="nowrap">{{ site.name }}</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 折叠动画由 main.css 的 .search-line.no-visible max-height 过渡实现 -->
            <div class="search-bottom">
              <a-divider :margin="10">
                <a-button shape="circle" size="mini" class="search-collapse-btn" @click="switchSearchPanel()">
                  <icon-down v-if="searchToolboxCollapsed"/>
                  <icon-up v-else/>
                </a-button>
              </a-divider>
            </div>

          </div>

          <!-- 编辑功能 -->
          <div>

            <!-- 导航本体 -->
            <draggable :list="box" handle=".category-drag-handle" :animation="100" draggable=".tab" group="tabs"
                       itemKey="index">
              <template #item="{element:tab, index: t}">
                <a-card :key="t" class="tab" :style="{ width: '100%','margin-top': '20px' }" :title="tab.name"
                        hoverable>
                  <template #extra>
                    <a-space size="medium">
                      <i class="iconfont icon-tuozhuai category-drag-handle grabbable" v-if="controlEditable"></i>
                      <i class="iconfont cursor-pointer icon-bianji" v-if="controlEditable" @click="promptTabAt(t)"></i>
                      <i class="iconfont cursor-pointer icon-chacha" v-if="controlEditable" @click="removeTabAt(t)"></i>
                    </a-space>
                  </template>

                  <a-tabs type="card" size="medium" :editable="controlEditable" :show-add-button="controlEditable"
                          @add="handleTabAdd(t)" @delete="handleTabDelete"
                          lazy-load
                          auto-switch>
                    <a-tab-pane v-for="(category, i) in tab.categories" :key="t + '_' + i" :title="category.name">
                      <draggable tag="ul" :list="category.links" class="list-group" :animation="100"
                                 draggable=".link-li"
                                 group="links" itemKey="i">
                        <template #item="{element :link, index: j}">
                          <li :class="{'link-li': true, 'link-li-editable':controlEditable}">
                            <div class="link-chip">
                              <img class="link-chip-image" alt=""
                                   :key="link.url"
                                   :data-host="getUrlHost(link.url)"
                                   decoding="async"
                                   @vue:mounted="onFaviconMount"
                                   @load="onFaviconLoad"
                                   @error="onFaviconError">
                              <a-tooltip :content="link.name" position="tl" mini>
                                <a class="link-a" :data-url="link.url" @click.left="goToUrl(t, i, j,link.url)"
                                   @click.middle="goToUrl(t, i, j,link.url)">{{ link.name }}</a>
                              </a-tooltip>
                              <div :class="{'link-chip-btn': true, 'hidden':!controlEditable}">
                                <i class="iconfont cursor-pointer icon-chacha" @click="removeLinkAt(t, i, j)"></i>
                              </div>
                            </div>
                          </li>
                        </template>
                        <template #footer>
                          <li class="link-li">
                            <div :class="{'link-chip': true,'cursor-pointer': true,'hidden':!controlEditable}"
                                 @click="promptLinkAt(t, i, category.links.length)">
                              <span class="link-chip-image">➕</span>
                              <a class="link-a" style="width: auto">添加</a>
                            </div>
                          </li>
                        </template>
                      </draggable>
                    </a-tab-pane>
                  </a-tabs>
                </a-card>
              </template>
            </draggable>

          </div>

        </div>

      </a-layout-content>

      <!--   设置侧边栏   -->
      <a-layout-sider
          :width="300"
          breakpoint="lg"
          hide-trigger
          collapsible
          collapsed-width="0"
          :collapsed="!controlEditable">

        <a-layout>
          <a-layout-header class="settings-header">设置</a-layout-header>
          <a-layout-content :class="{'hidden':!controlEditable}">
            <a-form :class="{'hidden':!settingsForm.visible}">
              <a-textarea v-model="boxStr" :class="{'json-textbox':true}" :auto-size="{ minRows:5, maxRows:20 }"/>
              <a-space style="margin-top: 14px" wrap>
                <a-button type="primary" @click="promptTabAt(box.length)"
                          size="small">
                  <template #icon>
                    <icon-plus/>
                  </template>
                  <template #default>添加导航面板</template>
                </a-button>
                <a-button type="secondary" @click="triggerJsonImport" size="small">
                  <template #icon>
                    <IconUpload/>
                  </template>
                  <template #default>导入 JSON</template>
                </a-button>
                <a-button type="secondary" @click="triggerBookmarkImport" size="small">
                  <template #icon>
                    <IconImport/>
                  </template>
                  <template #default>从书签文件导入</template>
                </a-button>
                <a-button type="secondary" @click="exportConfig" size="small">
                  <template #icon>
                    <IconExport/>
                  </template>
                  <template #default>导出配置</template>
                </a-button>
                <a-button type="primary" @click="openSyncModal" size="small">
                  <template #icon>
                    <IconCloud/>
                  </template>
                  <template #default>云端同步{{ syncConnected ? '·已开启' : '' }}</template>
                </a-button>
                <a-button type="secondary" @click="resetBox"
                          size="small">
                  <template #icon>
                    <IconUndo/>
                  </template>
                  <template #default>重置为默认</template>
                </a-button>
              </a-space>
              <!-- 隐藏的文件选择框,用于书签导入 / JSON 导入 -->
              <input ref="bookmarkFileInput" type="file" accept=".html,.htm,text/html" class="hidden"
                     @change="readBookmarkFile"/>
              <input ref="jsonFileInput" type="file" accept=".json,application/json,text/plain" class="hidden"
                     @change="readJsonFile"/>
            </a-form>
          </a-layout-content>
          <a-layout-footer class="settings-footer">
            <a-space wrap>
              <a-button type="secondary" long @click="switchSettingsPanel">收起设置</a-button>
            </a-space>
          </a-layout-footer>
        </a-layout>

      </a-layout-sider>
    </a-layout>
  </a-layout>

  <!-- 编辑名称/地址的弹窗(type: 1面板 2分类 3链接) -->
  <a-modal v-model:visible="form.visible" @ok="handleOk" simple>
    <a-form :model="form">
      <a-form-item field="name" label="名称">
        <a-input v-model="form.name" @pressEnter="handleOk"/>
      </a-form-item>
      <a-form-item field="url" label="地址" v-if="form.type >= 3">
        <a-input v-model="form.url" @pressEnter="handleOk"/>
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 书签导入预览弹窗:勾选要导入的面板 -->
  <a-modal v-model:visible="importModalVisible" title="从书签文件导入" :width="440" @ok="confirmBookmarkImport">
    <div class="import-preview-list">
      <a-checkbox-group v-model="importSelection" direction="vertical">
        <div v-for="(p, idx) in importPreviewPanels" :key="idx" class="import-preview-item">
          <a-checkbox :value="String(idx)">
            <span class="nowrap">{{ p.name }}</span>
            <span class="import-preview-meta">{{ p.catCount }} 个分类 · {{ p.linkCount }} 条链接</span>
          </a-checkbox>
        </div>
      </a-checkbox-group>
    </div>
    <div class="import-preview-tip">勾选需要导入的面板，导入后将追加到当前导航末尾。</div>
  </a-modal>

  <!-- 云端同步弹窗：GitHub Gist 存储，多设备共享同一份配置 -->
  <a-modal v-model:visible="syncModalVisible" title="云端同步" :width="480" :footer="false">

    <!-- 已连接：状态展示 + 手动操作 -->
    <template v-if="syncConnected">
      <div class="sync-meta-row"><span class="sync-meta-label">存储位置</span><span>私密 Gist（保存在你自己的 GitHub 账号中）</span></div>
      <div class="sync-meta-row"><span class="sync-meta-label">本机设备名</span><span>{{ syncSettings.deviceName || '未命名设备' }}</span></div>
      <div class="sync-meta-row"><span class="sync-meta-label">上次同步</span><span>{{ formatTime(syncSettings.lastSyncAt) }}</span></div>
      <div class="sync-meta-row">
        <span class="sync-meta-label">云端 Gist</span>
        <a-link v-if="syncSettings.gistUrl" :href="syncSettings.gistUrl" target="_blank">打开 Gist 页面</a-link>
        <span v-else>—</span>
      </div>
      <div class="sync-meta-row">
        <span class="sync-meta-label">Gist ID</span>
        <span class="sync-gist-id nowrap">{{ syncSettings.gistId }}</span>
        <a-button size="mini" type="text" @click="copyGistId">
          <template #icon>
            <IconCopy/>
          </template>
          复制 ID
        </a-button>
      </div>
      <div class="sync-tip" style="margin-top: 10px">
        自动同步开启时：本机修改后 3 秒自动上传；打开页面时自动检查并拉取云端更新；两端都有修改时由你选择使用哪一份。
      </div>
      <a-checkbox v-model="syncSettings.autoSync" style="margin-top: 6px">自动同步（推荐）</a-checkbox>
      <a-space wrap style="margin-top: 16px">
        <a-button type="primary" size="small" :loading="syncBusy" @click="pushToCloud(false)">
          <template #icon>
            <IconUpload/>
          </template>
          立即上传（覆盖云端）
        </a-button>
        <a-button size="small" :loading="syncBusy" @click="pullFromCloud">
          <template #icon>
            <IconDownload/>
          </template>
          立即拉取（覆盖本机）
        </a-button>
        <a-button size="small" status="danger" @click="disconnectSync">断开连接</a-button>
      </a-space>
    </template>

    <!-- 未连接：连接表单 -->
    <template v-else>
      <div class="sync-tip">
        配置将保存到你自己 GitHub 账号下的<b>私密 Gist</b>，多台设备登录后即可共享同一份导航配置，全程不经过任何第三方服务器。
      </div>
      <a-form :model="syncForm" layout="vertical">
        <a-form-item field="token" label="GitHub 访问令牌（必填）">
          <a-input-password v-model="syncForm.token" placeholder="github_pat_… 或 ghp_…" allow-clear/>
        </a-form-item>
        <a-form-item field="gistId" label="Gist ID（选填，留空自动创建）">
          <a-input v-model="syncForm.gistId" placeholder="32/64 位 Gist ID，多设备接入时填同一 ID" allow-clear/>
        </a-form-item>
        <a-form-item field="deviceName" label="本机设备名称">
          <a-input v-model="syncForm.deviceName" placeholder="如：公司电脑、MacBook，用于区分修改来源" allow-clear/>
        </a-form-item>
      </a-form>
      <div class="sync-tip">
        令牌获取：GitHub → Settings → Developer settings → Personal access tokens →
        <a-link href="https://github.com/settings/personal-access-tokens/new" target="_blank">Generate new token</a-link>，
        仅勾选 <b>Account permissions → Gists: Read and write</b> 即可（无需任何仓库权限；classic token 则仅勾选 gist scope）。<br/>
        安全说明：令牌明文保存在本机浏览器 localStorage，请勿使用带有仓库/管理员权限的令牌；私密 Gist 任何持有链接者可访问，请勿外传 Gist 链接。
      </div>
      <a-space style="margin-top: 8px">
        <a-button type="primary" :loading="syncBusy" @click="connectSync">
          <template #icon>
            <IconLink/>
          </template>
          连接并同步
        </a-button>
      </a-space>
    </template>
  </a-modal>

</template>

<script setup>
import {ref, reactive, watch, computed, onMounted} from "vue";
import draggable from 'vuedraggable';
import {
  IconApps,
  IconDown,
  IconUp,
  IconPlus,
  IconClose,
  IconGithub,
  IconImport,
  IconExport,
  IconSettings,
  IconUndo,
  IconCloud,
  IconUpload,
  IconDownload,
  IconLink,
  IconCopy,
  IconMoon,
  IconSun,
} from '@arco-design/web-vue/es/icon';
import {Message, Modal} from '@arco-design/web-vue';
import {createConfigGist, fetchConfig, updateConfig} from './sync/gist.js';
import defaultBox from './json/defaultBox.json'
import defaultSearchToolbox from './json/defaultSearchToolbox.json'
import defaultIcon from './icon.png'

/** ---------------- 设置面板 / 编辑模式 ---------------- */
let settingsForm = reactive({
  visible: false,
});

let cornerMenuPopupVisible = ref(false);
let controlEditable = ref(false);

/** ---------------- 数据加载与持久化（带容错） ---------------- */
const STORAGE_KEY = 'customBox';

// 校验数据结构是否合法: [{ name, categories: [{ name, links: [{ name, url }] }] }]
const isValidBox = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(panel =>
      panel && typeof panel.name === 'string' && Array.isArray(panel.categories)
      && panel.categories.every(category =>
          category && typeof category.name === 'string' && Array.isArray(category.links)
          && category.links.every(link =>
              link && typeof link.name === 'string' && typeof link.url === 'string')));
};

// 深拷贝默认配置：避免编辑/重置时引用到 JSON 模块内的同一对象，把默认值也改掉（修复原版隐患）
const cloneDefaultBox = () => JSON.parse(JSON.stringify(defaultBox));

// 读取本地配置：解析失败或结构非法时回退为默认配置，保证应用永不因脏数据而白屏
const loadInitialBox = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultBox();
    const parsed = JSON.parse(raw);
    if (!isValidBox(parsed)) throw new Error('数据结构不符合约定');
    return parsed;
  } catch (e) {
    console.error('[iLink] 本地配置已损坏，已回退为默认配置:', e);
    Message.error({content: '本地保存的导航配置已损坏，已自动恢复为默认配置', showIcon: true});
    return cloneDefaultBox();
  }
};

let box = reactive(loadInitialBox());
let boxStr = ref(JSON.stringify(box, null, 2)); // 展示在设置内的json字符串（格式化缩进）
let boxPreStr = JSON.stringify(box); // 双向同步防死循环的哨兵（紧凑格式）

const persistBox = (compactStr) => {
  try {
    localStorage.setItem(STORAGE_KEY, compactStr);
  } catch (e) {
    console.warn('[iLink] 配置写入 localStorage 失败:', e);
    Message.warning({content: '配置保存失败（存储空间不足或处于隐私模式）', showIcon: true});
  }
};

// box -> boxStr / localStorage
watch(box, (newVal) => {
  const compact = JSON.stringify(newVal);
  if (boxPreStr !== compact) {
    boxStr.value = JSON.stringify(newVal, null, 2);
    boxPreStr = compact;
    persistBox(compact);
    markLocalEdited(); // 通知云端同步模块：本机配置有变化（自动上传防抖）
  }
});

// boxStr -> box（在设置里手工编辑 JSON）
let lastJsonErrorAt = 0;
watch(boxStr, (newVal) => {
  try {
    const parsed = JSON.parse(newVal);
    if (!isValidBox(parsed)) {
      throw new Error('结构需为 [{ name, categories: [{ name, links: [{ name, url }] }] }]');
    }
    const compact = JSON.stringify(parsed);
    if (boxPreStr !== compact) {
      box.splice(0, box.length);
      box.push(...parsed);
      boxPreStr = compact;
      persistBox(compact);
    }
  } catch (e) {
    // 手工输入过程中 JSON 处于中间态是正常的，节流提示避免每个按键都弹错
    const now = Date.now();
    if (now - lastJsonErrorAt > 2000) {
      lastJsonErrorAt = now;
      Message.error({content: `JSON 配置无效：${e.message}`, showIcon: true});
    }
  }
});

/** ---------------- 重置 / 导出 ---------------- */
const resetBox = () => {
  box.splice(0, box.length);
  box.push(...cloneDefaultBox());
  Message.success({content: '已重置为默认配置', showIcon: true});
};

/** ---------------- JSON 配置文件导入（与导出/云端同步同一替换语义） ---------------- */
const jsonFileInput = ref(null);
const triggerJsonImport = () => {
  jsonFileInput.value && jsonFileInput.value.click();
};

const readJsonFile = (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = ''; // 重置以便可以重复选择同一文件
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(String(ev.target.result));
      if (!isValidBox(parsed)) {
        throw new Error('结构需为 [{ name, categories: [{ name, links: [{ name, url }] }] }]');
      }
      box.splice(0, box.length);
      box.push(...parsed);
      const linkCount = parsed.reduce((n, p) => n + p.categories.reduce((m, c) => m + c.links.length, 0), 0);
      Message.success({content: `已导入 ${parsed.length} 个面板、共 ${linkCount} 条链接`, showIcon: true});
    } catch (err) {
      console.error('[iLink] JSON 导入失败:', err);
      Message.error({content: `导入失败：${err.message}`, showIcon: true});
    }
  };
  reader.onerror = () => Message.error({content: '文件读取失败', showIcon: true});
  reader.readAsText(f);
};

// 把当前配置导出为 JSON 文件，作为手动备份手段
const exportConfig = () => {
  try {
    const blob = new Blob([JSON.stringify(box, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilink-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('[iLink] 配置导出失败:', e);
    Message.error({content: '配置导出失败', showIcon: true});
  }
};

/** ---------------- 云端同步（GitHub Gist 存储，可扩展其他后端） ----------------
 * 模型：整体快照同步（与 JSON 导入/导出同一替换语义），靠 updatedAt 时间戳做新者胜出；
 * - 自动同步开启时：本机编辑 3 秒防抖后自动上传；打开页面时自动检查云端更新；
 * - 冲突（云端与本机都有修改）时弹窗由用户选择使用哪一份，绝不静默丢数据。
 */
const SYNC_KEY = 'ilink-sync';
const AUTO_PUSH_DELAY = 3000;

const loadSyncSettings = () => {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && typeof s === 'object' ? s : null;
  } catch (e) {
    console.warn('[iLink] 云同步设置读取失败，已重置:', e);
    return null;
  }
};

let syncSettings = reactive(Object.assign({
  provider: 'gist',          // 当前存储后端标识，预留 supabase 等扩展
  token: '',
  gistId: '',
  gistUrl: '',
  deviceName: '',
  autoSync: true,
  lastSyncAt: 0,             // 上次成功同步（上传或拉取）时间
  lastCloudUpdatedAt: 0,     // 云端载荷的 updatedAt，用于判断"云端是否有新版本"
  lastLocalState: '',        // 上次同步成功时的本机配置快照，用于判断"本机是否有未同步修改"
}, loadSyncSettings() || {}));

const persistSyncSettings = () => {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify({
      provider: syncSettings.provider,
      token: syncSettings.token,
      gistId: syncSettings.gistId,
      gistUrl: syncSettings.gistUrl,
      deviceName: syncSettings.deviceName,
      autoSync: syncSettings.autoSync,
      lastSyncAt: syncSettings.lastSyncAt,
      lastCloudUpdatedAt: syncSettings.lastCloudUpdatedAt,
      lastLocalState: syncSettings.lastLocalState,
    }));
  } catch (e) {
    console.warn('[iLink] 云同步设置写入失败:', e);
  }
};
watch(syncSettings, persistSyncSettings, {deep: true});

const syncConnected = computed(() => !!(syncSettings.token && syncSettings.gistId));
const syncBusy = ref(false);
const syncModalVisible = ref(false);
const syncForm = reactive({token: '', gistId: '', deviceName: syncSettings.deviceName || ''});

let suppressAutoPush = false; // 拉取云端后短暂抑制自动上传，避免"拉取→触发编辑→立刻回传"的回声
let autoPushTimer = null;

const formatTime = (ts) => {
  if (!ts) return '从未';
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 本机配置变化时的自动上传调度（在 watch(box) 中被调用）
const markLocalEdited = () => {
  if (suppressAutoPush) return;
  if (!syncConnected.value || !syncSettings.autoSync) return;
  if (autoPushTimer) clearTimeout(autoPushTimer);
  autoPushTimer = setTimeout(() => {
    autoPushTimer = null;
    pushToCloud(true);
  }, AUTO_PUSH_DELAY);
};

// 把云端载荷应用到本机（整体替换，保持与 JSON 导入一致的语义）
const applyCloudToLocal = (payload, {silent = false} = {}) => {
  suppressAutoPush = true;
  setTimeout(() => { suppressAutoPush = false; }, AUTO_PUSH_DELAY + 500);
  const incoming = payload.box.map((p) => JSON.parse(JSON.stringify(p)));
  box.splice(0, box.length, ...incoming);
  syncSettings.lastCloudUpdatedAt = payload.updatedAt || 0;
  syncSettings.lastSyncAt = Date.now();
  syncSettings.lastLocalState = JSON.stringify(box);
  if (!silent) Message.success({content: '已应用云端配置', showIcon: true});
};

// 上传当前配置到云端（silent=true 时为自动同步，不弹提示）
const pushToCloud = async (silent = false) => {
  if (!syncConnected.value || syncBusy.value) return;
  syncBusy.value = true;
  try {
    await updateConfig(syncSettings.token, syncSettings.gistId, box, syncSettings.deviceName);
    syncSettings.lastCloudUpdatedAt = Date.now();
    syncSettings.lastSyncAt = Date.now();
    syncSettings.lastLocalState = JSON.stringify(box);
    if (!silent) Message.success({content: '已上传到云端（覆盖云端配置）', showIcon: true});
  } catch (e) {
    console.error('[iLink] 云端上传失败:', e);
    if (!silent) Message.error({content: `上传失败：${e.message}`, showIcon: true});
  } finally {
    syncBusy.value = false;
  }
};

// 从云端拉取配置（手动按钮，覆盖本机前二次确认）
const pullFromCloud = async () => {
  if (!syncConnected.value || syncBusy.value) return;
  syncBusy.value = true;
  try {
    const {payload} = await fetchConfig(syncSettings.token, syncSettings.gistId);
    if (!payload) {
      Message.warning({content: '云端还没有配置，可先「立即上传」把本机配置推上去', showIcon: true});
      return;
    }
    Modal.confirm({
      title: '从云端拉取配置',
      content: `将用云端配置（${formatTime(payload.updatedAt)} 由 ${payload.device || '未知设备'} 更新）覆盖本机当前配置，是否继续？`,
      okText: '覆盖本机',
      cancelText: '取消',
      onOk: () => applyCloudToLocal(payload),
    });
  } catch (e) {
    console.error('[iLink] 云端拉取失败:', e);
    Message.error({content: `拉取失败：${e.message}`, showIcon: true});
  } finally {
    syncBusy.value = false;
  }
};

// 打开页面时的自动检查：云端有新版本→静默应用或弹冲突选择；本机有未同步修改→自动补传
const startupSyncCheck = async () => {
  if (!syncConnected.value || !syncSettings.autoSync) return;
  try {
    const {payload} = await fetchConfig(syncSettings.token, syncSettings.gistId);
    if (!payload) {
      pushToCloud(true); // 云端为空：把本机配置作为初始版本推上去
      return;
    }
    const cloudNewer = (payload.updatedAt || 0) > (syncSettings.lastCloudUpdatedAt || 0);
    const localDirty = JSON.stringify(box) !== (syncSettings.lastLocalState || '');
    if (cloudNewer && !localDirty) {
      applyCloudToLocal(payload, {silent: true});
      Message.success({content: `已自动同步云端配置（来自 ${payload.device || '其他设备'}）`, showIcon: true});
    } else if (cloudNewer && localDirty) {
      Modal.confirm({
        title: '检测到配置冲突',
        content: `云端配置由「${payload.device || '未知设备'}」更新于 ${formatTime(payload.updatedAt)}，而本机在上次同步后也有修改。使用哪一份？`,
        okText: '使用云端（覆盖本机）',
        cancelText: '保留本机（稍后自动上传）',
        onOk: () => applyCloudToLocal(payload),
        onCancel: () => markLocalEdited(), // 保留本机：走自动上传防抖覆盖云端
      });
    } else if (!cloudNewer && localDirty) {
      pushToCloud(true);
    }
  } catch (e) {
    // 启动检查属于后台行为，失败仅记录日志，不打扰用户
    console.warn('[iLink] 启动时云端检查失败:', e.message);
  }
};

// 首次连接：校验令牌 → 复用或自动创建私密 Gist → 处理"云端已有旧配置"的情况
const connectSync = async () => {
  const token = syncForm.token.trim();
  if (!token) {
    Message.warning({content: '请填写 GitHub 访问令牌（Token）', showIcon: true});
    return;
  }
  const deviceName = syncForm.deviceName.trim() || '我的设备';
  syncBusy.value = true;
  try {
    let gistId = syncForm.gistId.trim();
    let first = {payload: null, gistHtmlUrl: ''};
    if (gistId) {
      first = await fetchConfig(token, gistId); // 同时完成令牌与 Gist ID 的有效性校验
      if (!first.payload) await updateConfig(token, gistId, box, deviceName); // Gist 为空：先上传本机
    } else {
      gistId = await createConfigGist(token, box, deviceName);
      first = await fetchConfig(token, gistId);
    }
    const finish = (payload) => {
      syncSettings.token = token;
      syncSettings.gistId = gistId;
      syncSettings.gistUrl = first.gistHtmlUrl;
      syncSettings.deviceName = deviceName;
      syncSettings.autoSync = true;
      syncSettings.lastCloudUpdatedAt = payload ? (payload.updatedAt || Date.now()) : Date.now();
      syncSettings.lastSyncAt = Date.now();
      syncSettings.lastLocalState = JSON.stringify(box);
      syncModalVisible.value = false;
      Message.success({content: '云端同步已开启，多设备将共享同一份配置', showIcon: true});
    };
    const cloudContent = first.payload ? JSON.stringify(first.payload.box) : '';
    if (cloudContent && cloudContent !== JSON.stringify(box)) {
      Modal.confirm({
        title: '检测到云端已有配置',
        content: `云端配置更新于 ${formatTime(first.payload.updatedAt)}（来源 ${first.payload.device || '未知设备'}）。使用哪一份？`,
        okText: '使用云端（覆盖本机）',
        cancelText: '保留本机（上传覆盖云端）',
        onOk: () => {
          applyCloudToLocal(first.payload, {silent: true});
          finish(first.payload);
        },
        onCancel: () => {
          updateConfig(token, gistId, box, deviceName)
              .then(() => finish(null))
              .catch((err) => Message.error({content: `上传失败：${err.message}`, showIcon: true}));
        },
      });
    } else {
      finish(first.payload);
    }
  } catch (e) {
    console.error('[iLink] 云端连接失败:', e);
    Message.error({content: `连接失败：${e.message}`, showIcon: true});
  } finally {
    syncBusy.value = false;
  }
};

// 断开连接：仅清除本机连接信息，云端 Gist 数据保留（可随时重连）
const disconnectSync = () => {
  Modal.confirm({
    title: '断开云端同步',
    content: '仅清除本机保存的连接信息；云端 Gist 中的配置数据会保留，之后可重新连接恢复。',
    okText: '断开',
    cancelText: '取消',
    onOk: () => {
      syncSettings.token = '';
      syncSettings.gistId = '';
      syncSettings.gistUrl = '';
      syncSettings.lastCloudUpdatedAt = 0;
      syncSettings.lastSyncAt = 0;
      syncSettings.lastLocalState = '';
      syncModalVisible.value = false;
      Message.success({content: '已断开云端同步', showIcon: true});
    },
  });
};

const openSyncModal = () => {
  syncForm.deviceName = syncSettings.deviceName || syncForm.deviceName;
  syncModalVisible.value = true;
};

// 复制 Gist ID：其他设备连接时需要填同一 ID；clipboard API 不可用时回退到临时文本域方案
const copyGistId = () => {
  const id = syncSettings.gistId;
  if (!id) return;
  const done = () => Message.success({content: 'Gist ID 已复制，在其他设备的「云端同步」弹窗中粘贴即可', showIcon: true});
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(id).then(done).catch(() => fallbackCopy(id, done));
  } else {
    fallbackCopy(id, done);
  }
};

const fallbackCopy = (text, done) => {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    done();
  } catch (e) {
    Message.warning({content: `复制失败，请手动复制：${text}`, showIcon: true});
  }
};

onMounted(() => {
  startupSyncCheck();
});

/** ---------------- 搜索 ---------------- */
let keywords = ref('');
const searchToolbox = reactive(defaultSearchToolbox);
const searchToolboxCollapsed = ref(true); // 修复：统一通过 .value 读写，避免 ref 被覆盖成普通值后丢失响应性

const switchSearchPanel = () => {
  searchToolboxCollapsed.value = !searchToolboxCollapsed.value;
  searchToolbox.forEach((line) => {
    if (line.canBeCollapsed === undefined || line.canBeCollapsed) {
      line.collapsed = searchToolboxCollapsed.value;
    }
  });
};

const goToSearch = (src) => {
  const q = (keywords.value || '').trim();
  // 关键词做 URL 编码，避免空格、&、+ 等字符破坏搜索链接
  window.open(src.replace('{q}', encodeURIComponent(q)));
};

/** ---------------- favicon ----------------
 * 图标自动匹配：对全部 504 个域名实测后按命中率排定的服务链（kucat 85% → 目标站直连 49% → 0x3 84%），
 * 联合覆盖 97%；全部失败时回退到内置图标。img 上通过 data-host / data-step / data-fallback 记录降级进度。
 * host→图标 解析缓存（内存 + localStorage）：同一域名多张图去重请求；
 * 二次访问直接用已解析 URL，零三方请求；缓存失效自愈（error 时逐出并从链首重试）。
 * 并发队列（8 路）：首屏上百个图标若同时发起会触发图标服务限流（实测洪峰下大量请求被挂起），
 * src 在出队时才赋值（真正发起请求），8 秒超时也从真正请求时起算；
 * 队列等待期间缓存被同域任务填充时，出队重查缓存可直接复用。
 * load 时清理计时器，并对 8px 以下无效占位图继续降级。
 */
const FAVICON_SERVICES = [
  (host) => `https://ico.kucat.cn/get.php?url=https://${host}/`,
  (host) => `https://${host}/favicon.ico`,
  (host) => `https://0x3.com/icon?host=${host}`,
];
const FAVICON_TIMEOUT = 8000;
const FAVICON_CONCURRENCY = 8;
const FAVICON_CACHE_KEY = 'ilink-favicon-cache-v1'; // 改动服务链时 bump 版本号以自动失效旧缓存
const FAVICON_CACHE_MAX = 800;
const faviconTimers = new WeakMap(); // img element -> 超时计时器
const faviconHostCache = (() => {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVICON_CACHE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
})();

let faviconCacheSyncTimer = null;
// 防抖持久化：图标成批加载，避免每个 load 都写一次 localStorage；超量时丢弃最早写入的条目
const persistFaviconCache = () => {
  if (faviconCacheSyncTimer) return;
  faviconCacheSyncTimer = setTimeout(() => {
    faviconCacheSyncTimer = null;
    try {
      const keys = Object.keys(faviconHostCache);
      for (const k of keys.slice(0, Math.max(0, keys.length - FAVICON_CACHE_MAX))) {
        delete faviconHostCache[k];
      }
      localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(faviconHostCache));
    } catch (e) { /* 隐私模式/配额不足时静默放弃，仅内存缓存仍然生效 */ }
  }, 2000);
};

const getUrlHost = (url) => {
  if (typeof url !== 'string') return '';
  const matched = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/?#]+)/.exec(url.trim());
  if (!matched) return '';
  // 去掉用户信息与端口，仅保留主机名
  return matched[1].replace(/.*@/, '').replace(/:\d+$/, '');
};

const clearFaviconTimer = (img) => {
  const timer = faviconTimers.get(img);
  if (timer) {
    clearTimeout(timer);
    faviconTimers.delete(img);
  }
};

const armFaviconTimer = (img) => {
  clearFaviconTimer(img);
  faviconTimers.set(img, setTimeout(() => {
    faviconTimers.delete(img);
    if (img.dataset.active === '1') { // 请求仍在进行：超时降级（服务挂起时不触发 error，靠这里收尾）
      finishFaviconAttempt(img);
      advanceFavicon(img);
    }
  }, FAVICON_TIMEOUT));
};

/** ---------------- 图标并发队列 ---------------- */
const faviconQueue = []; // 待发起的解析任务 {img, host, step}
let faviconActiveCount = 0;

const pumpFaviconQueue = () => {
  while (faviconActiveCount < FAVICON_CONCURRENCY && faviconQueue.length) {
    const job = faviconQueue.shift();
    const img = job.img;
    // 任务排队期间可能已降级完成/被卸载，直接丢弃（不占槽位）
    if (!img.isConnected || img.dataset.fallback === 'done') continue;
    faviconActiveCount++;
    img.dataset.active = '1';
    img.dataset.step = String(job.step);
    // 出队时重查缓存：排队期间同域图标可能已被其他任务解析成功
    img.src = faviconHostCache[job.host] || FAVICON_SERVICES[Math.max(0, job.step)](job.host);
    armFaviconTimer(img);
  }
};

const scheduleFavicon = (img, host, step) => {
  faviconQueue.push({img, host, step});
  pumpFaviconQueue();
};

// 结束当前尝试（成功/失败/超时）：释放并发槽位并停表
const finishFaviconAttempt = (img) => {
  clearFaviconTimer(img);
  if (img.dataset.active === '1') {
    delete img.dataset.active;
    faviconActiveCount--;
  }
};

// img 挂载时入队首个解析任务（配合 :key 保证换链接时状态干净）
// 注意 @vue:mounted 传入的是 vnode（元素在 .el 上），而 @load/@error 传入的是原生事件对象
const onFaviconMount = (vnode) => {
  const img = (vnode && vnode.el) || vnode;
  if (!(img instanceof Element) || !img.dataset || !img.dataset.host) return;
  delete img.dataset.fallback;
  // 命中缓存时 step=-1：缓存 URL 出错时应从链首重试而非跳级（advance 后落回 0）
  const host = img.dataset.host;
  scheduleFavicon(img, host, faviconHostCache[host] ? -1 : 0);
};

const onFaviconLoad = (e) => {
  const img = e.target;
  finishFaviconAttempt(img);
  if (img.dataset.fallback === 'done') return;
  // 尺寸异常（如 1x1 占位图）视为无效，继续降级；naturalWidth 为 0 时尚未完成解码，放行
  if (img.naturalWidth > 0 && img.naturalWidth < 8) {
    advanceFavicon(img);
    return;
  }
  // 记录解析成功的图标：兜底图不入缓存（避免瞬时网络故障把好域名永久标灰）
  const host = img.dataset.host;
  if (host && img.src && faviconHostCache[host] !== img.src) {
    faviconHostCache[host] = img.src;
    persistFaviconCache();
  }
};

const onFaviconError = (e) => {
  const img = e.target;
  finishFaviconAttempt(img);
  // 缓存的 URL 自身失效：逐出缓存，改走完整服务链重新解析
  const host = img.dataset.host;
  if (host && faviconHostCache[host] && img.src === faviconHostCache[host]) {
    delete faviconHostCache[host];
    persistFaviconCache();
  }
  advanceFavicon(img);
};

const advanceFavicon = (img) => {
  if (img.dataset.fallback === 'done') return;
  const host = img.dataset.host || '';
  const next = Number(img.dataset.step || '0') + 1;
  if (host && next < FAVICON_SERVICES.length) {
    scheduleFavicon(img, host, next);
  } else {
    img.dataset.fallback = 'done';
    img.src = defaultIcon;
  }
};

/** ---------------- 编辑：面板 / 分类 / 链接 ---------------- */
let form = reactive({
  visible: false,
  name: '',
  url: '',
  type: 3,
  t: 0,
  i: 0,
  j: 0,
});

const goToUrl = (t, i, j, url) => {
  if (!controlEditable.value) {
    window.open(url);
  } else {
    promptLinkAt(t, i, j);
  }
};
/** 操作面板 **/
const promptTabAt = (t) => {
  form.type = 1;
  if (t < box.length) {
    form.name = box[t].name
  } else {
    form.name = ''
  }

  form.t = t
  form.visible = true;
};
const submitTab = () => {
  if (form.t < box.length) {
    box[form.t].name = form.name
  } else {
    box.push({
      name: form.name,
      categories: []
    })
  }
  form.visible = false;
};
const removeTabAt = (t) => {
  box.splice(t, 1);
};

/** 操作类别 **/
const promptCategoryAt = (t, i) => {
  form.type = 2;
  let categories = box[t].categories
  if (i < categories.length) {
    form.name = categories[i].name
  } else {
    form.name = ''
  }

  form.t = t
  form.i = i
  form.visible = true;
};
const submitCategory = () => {
  let categories = box[form.t].categories
  if (form.i < categories.length) {
    categories[form.i].name = form.name
  } else {
    categories.push({
      name: form.name,
      links: []
    })
  }
  form.visible = false;
};
const removeCategoryAt = (t, i) => {
  box[t].categories.splice(i, 1);
};

/** 操作链接 **/
const promptLinkAt = (t, i, j) => {
  form.type = 3;
  let links = box[t].categories[i].links;
  if (j < links.length) {
    form.name = links[j].name;
    form.url = links[j].url;
  } else {
    form.name = ''
    form.url = ''
  }

  form.t = t;
  form.i = i;
  form.j = j;
  form.visible = true;
};
const submitLink = () => {
  let links = box[form.t].categories[form.i].links;
  if (form.j < links.length) {
    links[form.j].name = form.name;
    links[form.j].url = form.url;
  } else {
    links.push({
      name: form.name,
      url: form.url
    })
  }
  form.visible = false;
};
const removeLinkAt = (t, i, j) => {
  box[t].categories[i].links.splice(j, 1);
};
const handleOk = () => {
  if (!form.name.trim()) {
    Message.warning({content: '名称不能为空', showIcon: true});
    return;
  }
  if (form.type === 3) {
    if (!form.url.trim()) {
      Message.warning({content: '地址不能为空', showIcon: true});
      return;
    }
    // 没有协议头时自动补全 https://，避免 window.open 打开成相对路径
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(form.url.trim())) {
      form.url = 'https://' + form.url.trim();
    }
    submitLink();
  } else if (form.type === 2) {
    submitCategory();
  } else if (form.type === 1) {
    submitTab();
  } else {
    Message.error({content: '未知的编辑类型', showIcon: true});
    form.visible = false;
  }
};

const handleTabAdd = (t) => {
  promptCategoryAt(t, box[t].categories.length);
};
const handleTabDelete = (key) => {
  let arr = key.split('_')
  // 修复：key 是字符串，显式转成数字索引再删除
  removeCategoryAt(Number(arr[0]), Number(arr[1]));
};

/** ---------------- Chrome/浏览器书签导入（补完原半成品功能） ---------------- */
const bookmarkFileInput = ref(null);
const importModalVisible = ref(false);
const importPreviewPanels = ref([]);
const importSelection = ref([]);

const triggerBookmarkImport = () => {
  bookmarkFileInput.value && bookmarkFileInput.value.click();
};

const readBookmarkFile = (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = ''; // 重置以便可以重复选择同一文件
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (ev) => handleBookmarkHtml(String(ev.target.result));
  reader.onerror = () => Message.error({content: '文件读取失败', showIcon: true});
  reader.readAsText(f);
};

// 递归解析 Netscape 书签格式（DT/DL/H3/A 结构）
const parseBookmarkTree = (nodes, list) => {
  for (const node of nodes) {
    if (!node.tagName || node.tagName.toLowerCase() !== 'dt') continue;
    let name = null;
    let childDl = null;
    for (const child of node.children) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'h3') {
        // 文件夹：h3 为文件夹名
        name = (child.textContent || '').trim();
      } else if (tag === 'dl') {
        // 文件夹：dl 为子节点容器
        childDl = child;
      } else if (tag === 'a') {
        // 链接节点
        list.push({
          name: (child.textContent || '').trim(),
          url: child.getAttribute('href') || ''
        });
      }
    }
    // 文件夹继续递归
    if (name !== null && childDl !== null) {
      const children = [];
      list.push({name, children});
      parseBookmarkTree(childDl.children, children);
    }
  }
};

// 分割线文件夹（纯符号命名的节点）直接跳过
const isSeparator = (node) => /^[-─━=—_·\s]*$/.test(node.name || '');

// 收集某个文件夹下的全部链接（更深层子文件夹拍平合并）
const collectLinks = (nodes) => {
  const links = [];
  for (const node of nodes) {
    if (isSeparator(node)) continue;
    if (node.url) {
      links.push({name: node.name, url: node.url});
    } else if (Array.isArray(node.children)) {
      links.push(...collectLinks(node.children));
    }
  }
  return links;
};

// 把书签树转换为导航面板结构：
// 一级文件夹 -> 面板，二级文件夹 -> 分类，更深层内容拍平为链接
const buildPanelsFromBookmarkTree = (tree) => {
  // 典型浏览器导出：根下第一个节点是“书签栏”等大文件夹，其子项才是用户整理的内容
  let roots = tree;
  const firstFolder = tree.find((n) => Array.isArray(n.children) && n.children.length);
  if (firstFolder && tree.every((n) => !n.url)) {
    roots = [...firstFolder.children, ...tree.filter((n) => n !== firstFolder)];
  }

  const panels = [];
  const looseLinks = [];
  for (const node of roots) {
    if (isSeparator(node)) continue;
    if (Array.isArray(node.children)) {
      const categories = [];
      const directLinks = [];
      for (const child of node.children) {
        if (isSeparator(child)) continue;
        if (Array.isArray(child.children)) {
          const links = collectLinks(child.children);
          if (links.length) categories.push({name: child.name, links});
        } else if (child.url) {
          directLinks.push({name: child.name, url: child.url});
        }
      }
      // 文件夹下未分组的散链接单独归为一个分类
      if (directLinks.length) categories.unshift({name: '常用', links: directLinks});
      if (categories.length) panels.push({name: node.name, categories});
    } else if (node.url) {
      looseLinks.push({name: node.name, url: node.url});
    }
  }
  // 根级散链接归入一个“导入的书签”面板
  if (looseLinks.length) {
    panels.unshift({name: '导入的书签', categories: [{name: '未分类', links: looseLinks}]});
  }
  return panels;
};

const handleBookmarkHtml = (html) => {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rootDl = doc.querySelector('dl');
    if (!rootDl) throw new Error('不是有效的书签导出文件（Netscape 格式）');
    const tree = [];
    parseBookmarkTree(rootDl.children, tree);
    const panels = buildPanelsFromBookmarkTree(tree);
    if (!panels.length) throw new Error('未能从书签文件中解析出文件夹或链接');
    importPreviewPanels.value = panels.map((p) => ({
      name: p.name,
      categories: p.categories,
      catCount: p.categories.length,
      linkCount: p.categories.reduce((n, c) => n + c.links.length, 0),
    }));
    // 默认全选
    importSelection.value = importPreviewPanels.value.map((_, idx) => String(idx));
    importModalVisible.value = true;
  } catch (e) {
    Message.error({content: `书签解析失败：${e.message}`, showIcon: true});
  }
};

const confirmBookmarkImport = () => {
  const chosen = importPreviewPanels.value.filter((_, idx) => importSelection.value.includes(String(idx)));
  const valid = chosen.filter((p) => p.linkCount > 0);
  if (!valid.length) {
    Message.warning({content: '请至少勾选一个包含链接的面板', showIcon: true});
    return;
  }
  box.push(...valid.map(({name, categories}) => ({name, categories})));
  importModalVisible.value = false;
  Message.success({
    content: `已导入 ${valid.length} 个面板、共 ${valid.reduce((n, p) => n + p.linkCount, 0)} 条链接`,
    showIcon: true
  });
};

/** ---------------- 深色 / 浅色主题（body[arco-theme]） ---------------- */
const THEME_KEY = 'ilink-theme';
const isDarkTheme = ref(false);

const applyTheme = () => {
  document.body.setAttribute('arco-theme', isDarkTheme.value ? 'dark' : 'light');
};

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  try {
    localStorage.setItem(THEME_KEY, isDarkTheme.value ? 'dark' : 'light');
  } catch (e) {
    console.warn('[iLink] 主题偏好写入 localStorage 失败:', e);
  }
  applyTheme();
};

// 初始化：优先使用用户上次的选择，否则跟随系统 prefers-color-scheme
(() => {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch (e) { /* 隐私模式下读取失败，仅跟随系统 */ }
  isDarkTheme.value = saved
      ? saved === 'dark'
      : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme();
})();

/** ---------------- 角落菜单 / 设置面板 ---------------- */
const cornerMenuClick = (key, openKeys) => {
  if (key === '1') {
    window.open('https://github.com/bestop/ilink');
  } else if (key === '2') {
    switchSettingsPanel();
  } else if (key === '3') {
    toggleTheme();
  } else {
    Message.error({content: `未知的菜单key`, showIcon: true});
  }
  cornerMenuPopupVisible.value = !cornerMenuPopupVisible.value; // 点击后立马消失
}

const switchSettingsPanel = () => {
  if (controlEditable.value) {
    settingsForm.visible = !settingsForm.visible;
    controlEditable.value = !controlEditable.value;
  } else {
    controlEditable.value = !controlEditable.value;
    // 动画完成后再展示textarea,这样页面不会因为动画而卡顿,动画时常为200ms
    setTimeout(function () {
      settingsForm.visible = !settingsForm.visible;
    }, 300);
  }
}
</script>
