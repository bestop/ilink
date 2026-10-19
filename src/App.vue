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
      </a-menu>
    </template>
  </a-trigger>

  <!-- 下面是整个导航部分 -->
  <a-layout>
    <a-layout>
      <a-layout-content id="main-content">

        <!-- 搜索功能 -->
        <div
            style="padding: 20px; flex-direction: column; display: flex;  justify-content: center;  align-items: center;">
          <div style="width: 100%; max-width: 760px;">
            <a-space direction="vertical" size="large"
                     style="border: 1px solid var(--color-neutral-3); width: 100%;">
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
                             :src="getFaviconUrl(site.src)"
                             :data-host="getUrlHost(site.src)"
                             @error="onFaviconError">
                        <span class="nowrap">{{ site.name }}</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="search-bottom" :style="{ marginTop : searchToolboxCollapsed ? '-420px' : '0px'}">
              <a-divider :margin="10" v-if="searchToolboxCollapsed">
                <a-button shape="circle" size="mini" @click="switchSearchPanel()">
                  <icon-down v-if="searchToolboxCollapsed"/>
                </a-button>
              </a-divider>
              <a-divider :margin="10" v-if="!searchToolboxCollapsed">
                <a-button shape="circle" size="mini" @click="switchSearchPanel()">
                  <icon-up v-if="!searchToolboxCollapsed"/>
                </a-button>
              </a-divider>
            </div>

          </div>

          <!-- 编辑功能 -->
          <div style="width: 100%; max-width: 760px;">

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
                          auto-switch>
                    <a-tab-pane v-for="(category, i) in tab.categories" :key="t + '_' + i" :title="category.name">
                      <draggable tag="ul" :list="category.links" class="list-group" :animation="100"
                                 draggable=".link-li"
                                 group="links" itemKey="i">
                        <template #item="{element :link, index: j}">
                          <li :class="{'link-li': true, 'link-li-editable':controlEditable}">
                            <div class="link-chip">
                              <img class="link-chip-image" alt=""
                                   :src="getFaviconUrl(link.url)"
                                   :data-host="getUrlHost(link.url)"
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
          <a-layout-header style="text-align: center; padding: 10px; border-bottom: 1px">设置</a-layout-header>
          <a-layout-content :class="{'hidden':!controlEditable}">
            <a-form :class="{'hidden':!settingsForm.visible}">
              <a-textarea v-model="boxStr" :class="{'json-textbox':true}" :auto-size="{ minRows:5, maxRows:20 }"/>
              <a-space style="margin-top: 12px;margin-left: 6px" wrap>
                <a-button type="primary" @click="promptTabAt(box.length)"
                          size="mini">
                  <template #icon>
                    <icon-plus/>
                  </template>
                  <template #default>添加导航面板</template>
                </a-button>
                <a-button type="primary" @click="triggerBookmarkImport" size="mini">
                  <template #icon>
                    <IconImport/>
                  </template>
                  <template #default>从书签文件导入</template>
                </a-button>
                <a-button type="primary" @click="exportConfig" size="mini">
                  <template #icon>
                    <IconExport/>
                  </template>
                  <template #default>导出配置</template>
                </a-button>
                <a-button type="primary" @click="resetBox"
                          size="mini">
                  <template #icon>
                    <IconUndo/>
                  </template>
                  <template #default>重置为默认</template>
                </a-button>
              </a-space>
              <!-- 隐藏的文件选择框,用于书签导入 -->
              <input ref="bookmarkFileInput" type="file" accept=".html,.htm,text/html" class="hidden"
                     @change="readBookmarkFile"/>
            </a-form>
          </a-layout-content>
          <a-layout-footer style="text-align: center;height: 50px">
            <a-space wrap>
              <a-button type="secondary" @click="switchSettingsPanel">收起设置</a-button>
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

</template>

<script setup>
import {ref, reactive, watch} from "vue";
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
} from '@arco-design/web-vue/es/icon';
import {Message} from '@arco-design/web-vue';
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
 * 按顺序尝试多个公共 favicon 服务，全部失败时回退到内置图标。
 * img 上通过 data-host / data-step 记录降级进度。
 */
const FAVICON_SERVICES = [
  (host) => `https://0x3.com/icon?host=${host}`,
  (host) => `https://ico.kucat.cn/get.php?url=https://${host}/`,
];

const getUrlHost = (url) => {
  if (typeof url !== 'string') return '';
  const matched = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/?#]+)/.exec(url.trim());
  if (!matched) return '';
  // 去掉用户信息与端口，仅保留主机名
  return matched[1].replace(/.*@/, '').replace(/:\d+$/, '');
};

const getFaviconUrl = (url) => {
  const host = getUrlHost(url);
  return host ? FAVICON_SERVICES[0](host) : defaultIcon;
};

const onFaviconError = (e) => {
  const img = e.target;
  if (img.dataset.fallback === 'done') return; // 已降到内置图标，避免死循环
  const step = Number(img.dataset.step || '0');
  const host = img.dataset.host || '';
  const next = step + 1;
  if (host && next < FAVICON_SERVICES.length) {
    img.dataset.step = String(next);
    img.src = FAVICON_SERVICES[next](host);
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

/** ---------------- 角落菜单 / 设置面板 ---------------- */
const cornerMenuClick = (key, openKeys) => {
  if (key === '1') {
    window.open('https://github.com/bestop/ilink');
  } else if (key === '2') {
    switchSettingsPanel();
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
