window.__ModuleLoader__.load({id:'dsh-meeting-workspace-local',factory:(require)=>{const module={exports:{}};const exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/main.jsx
var main_exports = {};
__export(main_exports, {
  MeetingWorkspace: () => MeetingWorkspace,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(main_exports);

// src/client/api-response.mjs
async function readAPIResponse(response) {
  const text = await response.text();
  let value;
  try {
    value = JSON.parse(text);
    if (value === null || typeof value !== "object") throw Error("invalid response shape");
  } catch {
    const unavailable = [502, 503, 504].includes(response.status) || /^Harness (?:proxy failed|unavailable)/.test(text);
    const error = Error(unavailable ? "DSH \u672C\u673A\u670D\u52A1\u8FDE\u63A5\u672A\u5B8C\u6210\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : "\u672C\u673A\u670D\u52A1\u8FD4\u56DE\u7684\u5185\u5BB9\u65E0\u6CD5\u8BFB\u53D6\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    error.status = response.status;
    error.code = unavailable ? "HARNESS_UNAVAILABLE" : "INVALID_SERVICE_RESPONSE";
    throw error;
  }
  return value;
}

// src/client/workspace-icon.jsx
var import_react = __toESM(require("react"), 1);
var paths = {
  search: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "10.7", cy: "10.7", r: "6.3" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "m15.5 15.5 4 4" })),
  record: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "9", y: "3", width: "6", height: "12", rx: "3" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21m-3 0h6" })),
  import: /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5" }),
  document: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6m-6 4h6" })),
  forward: /* @__PURE__ */ import_react.default.createElement("path", { d: "m9 6 6 6-6 6" })
};
function WorkspaceIcon({ name, size = 17 }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, paths[name]);
}

// src/client/transcript-timeline.jsx
var import_react2 = __toESM(require("react"), 1);
var speakerNumber = /^(?:speaker|发言人|说话人)\s*(\d+)$/i;
var unknown = /^(?:speaker|发言人|说话人)?$/i;
function speakerIdentity(speaker) {
  const value = speaker.trim();
  if (unknown.test(value)) return { label: "\u672A\u6807\u6CE8\u53D1\u8A00\u4EBA", avatar: "?", tone: 0 };
  const numbered = value.match(speakerNumber)?.[1];
  if (numbered) return { label: "\u53D1\u8A00\u4EBA " + numbered, avatar: numbered, tone: (Number(numbered) - 1) % 6 + 1 };
  let tone = 0;
  for (const character of value) tone = (tone + character.codePointAt(0)) % 6;
  return { label: value, avatar: [...value][0], tone: tone + 1 };
}
function displayTime(time2) {
  const parts = time2.match(/^(\d{2,}:)?(\d{2}:\d{2})(?:[.,]\d+)?$/);
  return parts ? (parts[1] && parts[1] !== "00:" ? parts[1] : "") + parts[2] : time2;
}
function Icon({ name }) {
  return /* @__PURE__ */ import_react2.default.createElement("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, name === "search" ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("circle", { cx: "10.7", cy: "10.7", r: "6.7" }), /* @__PURE__ */ import_react2.default.createElement("path", { d: "m16 16 4 4" })) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("path", { d: "M4 20h16M5 15l-1 3 3-1L19 5l-2-2L5 15Z" }), /* @__PURE__ */ import_react2.default.createElement("path", { d: "m14.5 5.5 2 2" })));
}
function highlightText(text, query) {
  const index = query ? text.toLowerCase().indexOf(query) : -1;
  if (index < 0) return text;
  return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, text.slice(0, index), /* @__PURE__ */ import_react2.default.createElement("mark", null, text.slice(index, index + query.length)), text.slice(index + query.length));
}
function TranscriptRows({ rows, query = "", activeId, onAnchor }) {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mw-transcript-timeline" }, rows.map((row) => {
    const speaker = speakerIdentity(row.speaker);
    return /* @__PURE__ */ import_react2.default.createElement("article", { key: row.id, ref: onAnchor ? (el) => onAnchor(row.id, el) : void 0, className: activeId === row.id ? "highlight" : "" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "mw-transcript-avatar", "data-tone": speaker.tone, "aria-hidden": "true" }, speaker.avatar), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("strong", null, speaker.label), row.speakerAutomatic === "live" && /* @__PURE__ */ import_react2.default.createElement("span", null, "\u6682\u5B9A"), /* @__PURE__ */ import_react2.default.createElement("span", { title: row.time }, displayTime(row.time))), /* @__PURE__ */ import_react2.default.createElement("p", null, highlightText(row.text, query))));
  }));
}
function TranscriptTimeline({ rows, busy, onEdit, canEdit }) {
  const [showSearch, setShowSearch] = (0, import_react2.useState)(false), [search, setSearch] = (0, import_react2.useState)("");
  const query = showSearch ? search.trim().toLowerCase() : "";
  const matches = query ? rows.filter((row) => row.text.toLowerCase().includes(query) || speakerIdentity(row.speaker).label.toLowerCase().includes(query)) : rows;
  return /* @__PURE__ */ import_react2.default.createElement("section", { className: "mw-full-transcript", "aria-label": "\u6587\u5B57\u8BB0\u5F55" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mw-transcript-heading" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h2", null, "\u6587\u5B57\u8BB0\u5F55"), /* @__PURE__ */ import_react2.default.createElement("span", null, rows.length, " \u6BB5")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mw-transcript-icon", title: "\u641C\u7D22\u9010\u5B57\u7A3F", "aria-label": "\u641C\u7D22\u9010\u5B57\u7A3F", "aria-expanded": showSearch, onClick: () => setShowSearch(!showSearch) }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "search" })), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mw-transcript-icon", title: "\u7F16\u8F91\u9010\u5B57\u7A3F", "aria-label": "\u7F16\u8F91\u9010\u5B57\u7A3F", disabled: !canEdit, onClick: onEdit }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "edit" })))), showSearch && /* @__PURE__ */ import_react2.default.createElement("label", { className: "mw-transcript-search" }, /* @__PURE__ */ import_react2.default.createElement("input", { autoFocus: true, "aria-label": "\u641C\u7D22\u53D1\u8A00\u4EBA\u6216\u539F\u6587", placeholder: "\u641C\u7D22\u53D1\u8A00\u4EBA\u6216\u539F\u6587", value: search, onChange: (e) => setSearch(e.target.value) }), /* @__PURE__ */ import_react2.default.createElement("span", { role: "status" }, matches.length, " \u6BB5")), busy && /* @__PURE__ */ import_react2.default.createElement("p", { className: "small muted", role: "status" }, "\u6B63\u5728\u81EA\u52A8\u6807\u6CE8\u53D1\u8A00\u4EBA\u2026"), matches.length ? /* @__PURE__ */ import_react2.default.createElement(TranscriptRows, { rows: matches, query }) : /* @__PURE__ */ import_react2.default.createElement("p", { className: "empty" }, query ? "\u6CA1\u6709\u5339\u914D\u7684\u53D1\u8A00" : "\u6682\u65E0\u9010\u5B57\u7A3F"));
}

// src/task-editing.mjs
function taskOwners(task) {
  return Array.isArray(task.owners) ? [...task.owners] : task.owner?.trim() ? [task.owner.trim()] : [];
}
function peopleFor(data, { assignableOnly = false } = {}) {
  const archived = new Set(data.archivedTaskPeople);
  return [.../* @__PURE__ */ new Set([...data.taskPeople || [], ...data.meetings.flatMap((m) => m.tasks.flatMap(taskOwners))])].filter((name) => !assignableOnly || !archived.has(name)).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
function setTaskPersonAvailable(data, name, available) {
  if (!validPerson(name)) throw Error("\u8D1F\u8D23\u4EBA\u59D3\u540D\u65E0\u6548");
  const archived = new Set(data.archivedTaskPeople), people = new Set(data.taskPeople);
  if (available) {
    archived.delete(name);
    people.add(name);
  } else {
    people.delete(name);
    archived.add(name);
  }
  if (archived.size > 1e3 || people.size > 1e3) throw Error("\u8D1F\u8D23\u4EBA\u540D\u5355\u5DF2\u8FBE 1000 \u4EBA\u4E0A\u9650");
  data.taskPeople = [...people];
  data.archivedTaskPeople = [...archived];
}
function validPerson(name) {
  return typeof name === "string" && name.trim() === name && !!name && name.length <= 80 && !/[\r\n\t]/.test(name);
}
function validTaskDate(value) {
  if (value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = /* @__PURE__ */ new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && Number(value.slice(0, 4)) >= 1e3;
}
function patchTask(data, meetingId, taskId, patch, expected = {}) {
  const meeting = data.meetings.find((m) => m.id === meetingId), task = meeting?.tasks.find((t) => t.id === taskId);
  if (!task) throw Error("\u4EFB\u52A1\u5DF2\u5220\u9664\uFF0C\u8BF7\u91CD\u65B0\u52A0\u8F7D");
  const allowed = ["title", "owners", "due", "project", "done"];
  if (!patch || !Object.keys(patch).length || Object.keys(patch).some((k) => !allowed.includes(k))) throw Error("\u4EFB\u52A1\u4FEE\u6539\u5B57\u6BB5\u65E0\u6548");
  const current = (k) => k === "owners" ? taskOwners(task) : k === "project" ? task.project || meeting.project : task[k];
  for (const [key, value] of Object.entries(expected)) if (JSON.stringify(current(key)) !== JSON.stringify(value)) throw Error("\u8BE5\u5185\u5BB9\u5DF2\u5728\u5176\u4ED6\u7A97\u53E3\u4FEE\u6539\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u4FDD\u5B58");
  if ("title" in patch && (typeof patch.title !== "string" || !patch.title.trim() || patch.title.trim().length > 1e3)) throw Error("\u8BF7\u8F93\u5165 1 \u81F3 1000 \u5B57\u7684\u4EFB\u52A1\u5185\u5BB9");
  if ("owners" in patch && (!Array.isArray(patch.owners) || patch.owners.length > 30 || patch.owners.some((n) => !validPerson(n)) || new Set(patch.owners).size !== patch.owners.length)) throw Error("\u8BF7\u9009\u62E9\u6709\u6548\u8D1F\u8D23\u4EBA\uFF0C\u6BCF\u9879\u4EFB\u52A1\u6700\u591A 30 \u4EBA");
  if ("due" in patch && !validTaskDate(patch.due)) throw Error("\u8BF7\u9009\u62E9\u6709\u6548\u622A\u6B62\u65E5\u671F");
  if ("project" in patch && !data.projects.some((p) => p.id === patch.project)) throw Error("\u9879\u76EE\u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
  if ("done" in patch && typeof patch.done !== "boolean") throw Error("\u4EFB\u52A1\u72B6\u6001\u65E0\u6548");
  if ("title" in patch) task.title = patch.title.trim();
  if ("owners" in patch) {
    const archived = new Set(data.archivedTaskPeople);
    const people = /* @__PURE__ */ new Set([...data.taskPeople || [], ...patch.owners.filter((name) => !archived.has(name))]);
    if (people.size > 1e3) throw Error("\u8D1F\u8D23\u4EBA\u540D\u5355\u5DF2\u8FBE 1000 \u4EBA\u4E0A\u9650");
    task.owners = [...patch.owners];
    task.owner = patch.owners.join("\u3001");
    data.taskPeople = [...people];
  }
  for (const key of ["due", "project", "done"]) if (key in patch) task[key] = patch[key];
  return task;
}
function removeProject(data, id) {
  if (id === "default") throw Error("\u672A\u5206\u7C7B\u9879\u76EE\u4E0D\u80FD\u5220\u9664");
  for (const m of data.meetings) {
    if (m.project === id) m.project = "default";
    for (const task of m.tasks) if (task.project === id) task.project = "default";
  }
  for (const plan of data.plans || []) if (plan.project === id) plan.project = "default";
  if (data.meetingDetection?.project === id) data.meetingDetection.project = "default";
  if (data.calendarConfig?.project === id) data.calendarConfig.project = "default";
  data.projects = data.projects.filter((p) => p.id !== id);
}

// src/model.mjs
var MAX_TEXT = 2e6;
function emptyData() {
  return { version: 1, projects: [{ id: "default", name: "\u672A\u5206\u7C7B" }], meetings: [], plans: [], assistant: {} };
}
function parseTranscript(text) {
  if (typeof text !== "string" || !text.trim()) throw Error("\u9010\u5B57\u7A3F\u4E0D\u80FD\u4E3A\u7A7A");
  if (text.length > MAX_TEXT) throw Error("\u9010\u5B57\u7A3F\u8FC7\u957F\uFF0C\u8BF7\u5206\u6BB5\u5BFC\u5165");
  if (text.includes("-->")) {
    const blocks = text.replace(/\r/g, "").split(/\n\s*\n/);
    const rows = [];
    for (const block of blocks) {
      const lines = block.split("\n"), i = lines.findIndex((l) => l.includes("-->"));
      if (i < 0) continue;
      const text2 = lines.slice(i + 1).join(" ").replace(/<[^>]*>/g, "").trim();
      if (text2) rows.push({ id: crypto.randomUUID(), time: lines[i].split("-->")[0].trim().replace(/[,.]\d+$/, ""), speaker: "\u53D1\u8A00\u4EBA", text: text2, final: true });
    }
    if (rows.length) return rows;
  }
  return text.replace(/\r/g, "").split("\n").filter((l) => l.trim()).map((line, i) => {
    const m = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(?:([^：:]{1,30})[：:]\s*)?(.*)$/), s = line.match(/^([^：:]{1,30})[：:]\s*(.*)$/);
    return { id: crypto.randomUUID(), time: m?.[1] || `\u6BB5\u843D ${i + 1}`, speaker: m?.[2] || s?.[1] || "\u53D1\u8A00\u4EBA", text: m?.[3] || s?.[2] || line.trim(), final: true };
  });
}
function createMeeting(title, project = "default", text = "", date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
  return { id: crypto.randomUUID(), title: title.trim() || "\u672A\u547D\u540D\u4F1A\u8BAE", project, date, duration: 0, participants: [], status: "\u5F85\u6574\u7406", summary: "", decisions: [], tasks: [], transcript: text ? parseTranscript(text) : [], audio: [], source: "\u624B\u52A8\u521B\u5EFA" };
}
function meetingTranscript(meeting) {
  return meeting.speakerTranscript?.length ? meeting.speakerTranscript : meeting.transcript;
}
function validateData(d) {
  if (!d || d.version !== 1 || !Array.isArray(d.projects) || !Array.isArray(d.meetings) || d.projects.length > 1e3 || d.meetings.length > 5e3) throw Error("\u5907\u4EFD\u683C\u5F0F\u65E0\u6548");
  if (d.storagePolicy !== void 0 && (!d.storagePolicy || ![0, 7, 30, 90, 180, 365].includes(d.storagePolicy.retentionDays))) throw Error("\u5F55\u97F3\u4FDD\u7559\u671F\u9650\u65E0\u6548");
  const validID = (x) => typeof x === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(x);
  for (const list of [d.taskPeople, d.archivedTaskPeople]) {
    if (list !== void 0 && (!Array.isArray(list) || list.length > 1e3 || list.some((name) => !validPerson(name)) || new Set(list).size !== list.length)) throw Error("\u8D1F\u8D23\u4EBA\u540D\u5355\u65E0\u6548");
  }
  const projects = /* @__PURE__ */ new Set(), meetings = /* @__PURE__ */ new Set(), tasks = /* @__PURE__ */ new Set();
  for (const p of d.projects) {
    if (!validID(p.id) || projects.has(p.id) || typeof p.name !== "string" || !p.name.trim() || p.name.length > 100) throw Error("\u9879\u76EE\u6570\u636E\u65E0\u6548");
    projects.add(p.id);
  }
  if (!projects.has("default")) throw Error("\u5907\u4EFD\u7F3A\u5C11\u672A\u5206\u7C7B\u9879\u76EE");
  for (const m of d.meetings) {
    if (!validID(m.id) || meetings.has(m.id) || typeof m.title !== "string" || !m.title.trim() || m.title.length > 200 || !projects.has(m.project) || typeof m.summary !== "string" || m.summary.length > MAX_TEXT || !Array.isArray(m.transcript) || !Array.isArray(m.tasks) || !Array.isArray(m.decisions) || !Array.isArray(m.audio) || !Array.isArray(m.participants)) throw Error("\u4F1A\u8BAE\u6570\u636E\u6216\u9879\u76EE\u5173\u8054\u65E0\u6548");
    meetings.add(m.id);
    const diagram = m.summaryDiagram;
    if (diagram != null && (!["topics", "flow", "timeline"].includes(diagram.type) || typeof diagram.title !== "string" || diagram.title.length > 160 || !Array.isArray(diagram.steps) || diagram.steps.length < 2 || diagram.steps.length > 12 || diagram.steps.some((step) => !step || typeof step.title !== "string" || step.title.length > 160 || typeof step.detail !== "string" || step.detail.length > 1800 || !validID(step.paragraphId)))) throw Error("\u4F1A\u8BAE\u56FE\u89E3\u683C\u5F0F\u65E0\u6548");
    if (m.liveQuestions !== void 0 && (!Array.isArray(m.liveQuestions) || m.liveQuestions.length > 24 || m.liveQuestions.some((row) => !row || typeof row.question !== "string" || row.question.length > 4e3 || typeof row.answer !== "string" || row.answer.length > 16e3))) throw Error("\u4F1A\u4E2D\u95EE\u7B54\u683C\u5F0F\u65E0\u6548");
    if (m.audioKeepForever !== void 0 && typeof m.audioKeepForever !== "boolean") throw Error("\u5F55\u97F3\u4FDD\u7559\u6807\u8BB0\u65E0\u6548");
    if (m.speakerTranscript !== void 0 && (!Array.isArray(m.speakerTranscript) || m.speakerTranscript.length > 1e4)) throw Error("\u53D1\u8A00\u4EBA\u9010\u5B57\u7A3F\u683C\u5F0F\u65E0\u6548");
    for (const r of [...m.transcript, ...m.speakerTranscript || []]) {
      if (!validID(r.id) || typeof r.text !== "string" || typeof r.time !== "string" || typeof r.speaker !== "string" || r.text.length > MAX_TEXT) throw Error("\u9010\u5B57\u7A3F\u6BB5\u843D\u65E0\u6548");
    }
    for (const t of m.tasks) {
      if (!validID(t.id) || tasks.has(t.id) || typeof t.title !== "string" || !t.title.trim() || typeof t.owner !== "string" || typeof t.due !== "string" || typeof t.done !== "boolean" || t.ref !== null && t.ref !== void 0 && (!Number.isInteger(t.ref) || !m.transcript[t.ref])) throw Error("\u4EFB\u52A1\u6216\u6765\u6E90\u5173\u8054\u65E0\u6548");
      if (t.owners !== void 0 && (!Array.isArray(t.owners) || t.owners.length > 30 || t.owners.some((n) => !validPerson(n)) || new Set(t.owners).size !== t.owners.length || t.owner !== t.owners.join("\u3001"))) throw Error("\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u65E0\u6548");
      if (t.project !== void 0 && !projects.has(t.project)) throw Error("\u4EFB\u52A1\u9879\u76EE\u4E0D\u5B58\u5728");
      tasks.add(t.id);
    }
    for (const v of m.decisions) {
      if (typeof v.text !== "string" || v.ref !== null && v.ref !== void 0 && (!Number.isInteger(v.ref) || !m.transcript[v.ref])) throw Error("\u51B3\u7B56\u6765\u6E90\u65E0\u6548");
    }
    for (const a of m.audio) {
      if (!validID(a.id) || typeof a.mime !== "string" || typeof a.name !== "string") throw Error("\u97F3\u9891\u7D22\u5F15\u65E0\u6548");
    }
  }
  if (d.meetingDetection !== void 0 && (!d.meetingDetection || typeof d.meetingDetection.enabled !== "boolean" || d.meetingDetection.offlineEnabled !== void 0 && typeof d.meetingDetection.offlineEnabled !== "boolean" || !projects.has(d.meetingDetection.project))) throw Error("\u4F1A\u8BAE\u68C0\u6D4B\u914D\u7F6E\u65E0\u6548");
  if (d.calendarConfig !== void 0) {
    const c = d.calendarConfig;
    if (!c || typeof c.enabled !== "boolean" || !Array.isArray(c.ids) || c.ids.length > 1e3 || c.ids.some((id) => typeof id !== "string" || id.length > 1e3) || c.project && !projects.has(c.project)) throw Error("\u65E5\u5386\u540C\u6B65\u914D\u7F6E\u65E0\u6548");
  }
  if (d.plans !== void 0) {
    if (!Array.isArray(d.plans) || d.plans.length > 2e3) throw Error("\u4F1A\u8BAE\u5B89\u6392\u683C\u5F0F\u65E0\u6548");
    const ids = /* @__PURE__ */ new Set();
    for (const p of d.plans) {
      if (!validID(p.id) || ids.has(p.id) || typeof p.title !== "string" || !p.title.trim() || p.title.length > 200 || !projects.has(p.project) || typeof p.startsAt !== "string" || !Number.isFinite(Date.parse(p.startsAt)) || typeof p.agenda !== "string" || p.agenda.length > 2e4 || !["\u5DF2\u5B89\u6392", "\u63D0\u9192\u4E2D", "\u5F85\u786E\u8BA4", "\u5DF2\u5F00\u59CB", "\u5DF2\u5FFD\u7565", "\u5DF2\u9519\u8FC7", "\u5DF2\u53D6\u6D88"].includes(p.status) || p.remindAt && !Number.isFinite(Date.parse(p.remindAt))) throw Error("\u4F1A\u8BAE\u5B89\u6392\u5185\u5BB9\u65E0\u6548");
      if (p.deletedAt !== void 0 && (typeof p.deletedAt !== "string" || !Number.isFinite(Date.parse(p.deletedAt)) || p.status !== "\u5DF2\u53D6\u6D88")) throw Error("\u4F1A\u8BAE\u5B89\u6392\u5220\u9664\u6807\u8BB0\u65E0\u6548");
      if (p.localOverride !== void 0 && typeof p.localOverride !== "boolean") throw Error("\u4F1A\u8BAE\u5B89\u6392\u540C\u6B65\u6807\u8BB0\u65E0\u6548");
      ids.add(p.id);
    }
  }
  if (d.assistant !== void 0 && (!d.assistant || typeof d.assistant !== "object" || Array.isArray(d.assistant))) throw Error("\u4F1A\u8BDD\u5173\u8054\u683C\u5F0F\u65E0\u6548");
  return d;
}
function allTasks(data) {
  return data.meetings.flatMap((m) => m.tasks.map((t) => ({ ...t, meetingId: m.id, meetingTitle: m.title, project: t.project || m.project })));
}
function markdown(m, project) {
  const graph = m.summaryDiagram;
  const diagram = Array.isArray(graph?.steps) && graph.steps.length ? [`## ${graph.title}

` + graph.steps.map((step, i) => {
    const row = m.transcript.find((r) => r.id === step.paragraphId);
    return `${graph.type === "topics" ? "-" : i + 1 + "."} **${step.title}**${row ? " [" + row.time + "]" : ""}
  ${step.detail}`;
  }).join("\n\n")] : [];
  return [`# ${m.title}`, `${m.date} \xB7 ${project || ""}`, `## \u4F1A\u8BAE\u6458\u8981

${m.summary}`, ...diagram, `## \u884C\u52A8\u4E8B\u9879

${m.tasks.map((t) => `- [${t.done ? "x" : " "}] ${t.title} \xB7 ${taskOwners(t).join("\u3001") || "\u672A\u5206\u914D"} \xB7 ${t.due || "\u65E0\u622A\u6B62\u65E5\u671F"}`).join("\n")}`, `## \u9010\u5B57\u7A3F

${meetingTranscript(m).map((r) => `[${r.time}] ${r.speaker}\uFF1A${r.text}`).join("\n\n")}`].join("\n\n");
}
function taskMatchesDue(t, filter, today2) {
  if (filter === "unset") return !t.due;
  if (filter === "overdue") return !!t.due && !t.done && t.due < today2;
  if (filter === "week") {
    const end = /* @__PURE__ */ new Date(today2 + "T12:00:00");
    end.setDate(end.getDate() + 7);
    return !!t.due && t.due >= today2 && t.due <= end.toLocaleDateString("sv-SE");
  }
  return true;
}
function duplicateTranscript(data, item) {
  if (!item.transcript.length) return null;
  const content = (m) => JSON.stringify(m.transcript.map(({ time: time2, speaker, text }) => [time2, speaker, text]));
  const target = content(item);
  return data.meetings.find((m) => m.title === item.title && m.date === item.date && content(m) === target) || null;
}
function meetingAudio(meeting) {
  const audio = meeting?.audio || [];
  const mixed = audio.filter((a) => a.source === "mixed");
  if (mixed.length) return [mixed.at(-1)];
  const recovered = audio.filter((a) => a.source === "recovered");
  if (recovered.length) return [recovered.at(-1)];
  return audio.filter((a) => !a.source);
}

// src/transcript-timeline.mjs
function needsSpeakerAnalysis(meeting) {
  const retryOldLimit = meeting?.duration <= 7200 && meeting.speakerAnalysisVersion !== 2 && /30 分钟/.test(meeting.speakerStatus || "");
  return Boolean(meeting?.captureId && meeting.audio.length && (!meeting.speakerAutoAttempted || retryOldLimit) && !meeting.speakerTranscript?.length && !["\u5F55\u5236\u4E2D", "\u5F55\u97F3\u4E2D", "\u51C6\u5907\u5F55\u97F3", "\u6682\u505C\u4E2D"].includes(meeting.status) && meeting.transcript.some((row) => row.speaker === "\u53D1\u8A00\u4EBA") && !meeting.transcript.some((row) => /^发言人 \d+$/.test(row.speaker)));
}
function editableTimeline(rows) {
  return rows.map((row) => "[" + row.time + "] " + row.speaker + "\uFF1A" + row.text).join("\n\n");
}
function editTimeline(value, previous) {
  if (typeof value !== "string" || !value.trim() || value.length > MAX_TEXT) return parseTranscript(value);
  const rows = [];
  let row;
  for (const line of value.replace(/\r/g, "").split("\n")) {
    const match = line.match(/^\[([^\]\n]+)\]\s*([^：:\n]+)[：:]\s?(.*)$/);
    if (match) {
      row = { time: match[1], speaker: match[2], text: match[3] };
      rows.push(row);
    } else if (row) row.text += "\n" + line;
    else if (line.trim()) return parseTranscript(value);
  }
  if (!rows.length || rows.every((row2) => !row2.text.trim())) return parseTranscript("");
  return rows.filter((row2) => row2.text.trim()).map((row2, index) => {
    const original = previous[index];
    const sameTime = original?.time === row2.time;
    return { ...sameTime ? original : { id: crypto.randomUUID(), final: true }, ...row2, text: row2.text.trim() };
  });
}

// src/client/feishu-minutes-import.jsx
var import_react3 = __toESM(require("react"), 1);
function FeishuMinutesImport({ draft, setDraft, api: api2, run, busy, projectSelect }) {
  const [error, setError] = (0, import_react3.useState)(null);
  const [auth, setAuth] = (0, import_react3.useState)(null);
  const [reading, setReading] = (0, import_react3.useState)(false);
  const preview = draft.minutesPreview;
  const patch = (change) => setDraft((value) => ({ ...value, ...change }));
  (0, import_react3.useEffect)(() => {
    if (!auth?.pending) return;
    let active = true, checking = false;
    const timer = setInterval(async () => {
      if (checking) return;
      checking = true;
      try {
        const status = await api2("/minutes/authorization");
        if (active) setAuth(status);
      } catch (e) {
        if (active) setAuth({ error: e.message });
      } finally {
        checking = false;
      }
    }, 2e3);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [auth?.pending]);
  function readMinutes() {
    return run(async () => {
      setError(null);
      setReading(true);
      try {
        const result = await api2("/minutes/preview", { link: draft.minutesLink });
        patch({ minutesPreview: result, minutesTitle: result.title, minutesDate: result.date || draft.date });
      } catch (e) {
        if (e.status === 401 && auth?.authorized) setAuth(null);
        setError(e);
      } finally {
        setReading(false);
      }
    });
  }
  function authorize() {
    return run(async () => {
      setAuth(null);
      try {
        setAuth(await api2("/minutes/authorization", {}));
      } catch (e) {
        setAuth({ error: e.message });
      }
    });
  }
  return /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("label", null, "\u98DE\u4E66\u5999\u8BB0\u94FE\u63A5", /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      "aria-label": "\u98DE\u4E66\u5999\u8BB0\u94FE\u63A5",
      placeholder: "https://\u7EC4\u7EC7\u57DF\u540D.feishu.cn/minutes/\u2026",
      disabled: busy,
      value: draft.minutesLink || "",
      maxLength: 2e3,
      onChange: (e) => {
        setError(null);
        patch({ minutesLink: e.target.value, minutesPreview: null });
      }
    }
  )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "actions mw-minutes-actions" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", disabled: busy || !draft.minutesLink?.trim(), onClick: readMinutes }, reading ? "\u6B63\u5728\u8BFB\u53D6\u9010\u5B57\u7A3F\u2026" : "\u8BFB\u53D6\u5999\u8BB0"), error?.status === 401 && !auth?.pending && !auth?.authorized && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", disabled: busy, onClick: authorize }, "\u6388\u6743\u98DE\u4E66"), auth?.pending && /* @__PURE__ */ import_react3.default.createElement("a", { href: auth.url, target: "_blank", rel: "noopener noreferrer" }, "\u6253\u5F00\u98DE\u4E66\u6388\u6743\u9875 \u2197"), error?.status === 503 && /* @__PURE__ */ import_react3.default.createElement("a", { href: "https://github.com/larksuite/cli", target: "_blank", rel: "noopener noreferrer" }, "\u98DE\u4E66\u5B98\u65B9 CLI \u5B89\u88C5\u4E0E\u914D\u7F6E \u2197")), error && !(auth?.authorized && error.status === 401) && /* @__PURE__ */ import_react3.default.createElement("p", { className: "mw-capture-warning", role: "alert" }, error.message), auth?.pending && /* @__PURE__ */ import_react3.default.createElement("p", { className: "small muted", role: "status" }, "\u6B63\u5728\u7B49\u5F85\u98DE\u4E66\u6388\u6743\u3002\u5B8C\u6210\u540E\u53EF\u91CD\u65B0\u8BFB\u53D6\u5999\u8BB0\u3002"), auth?.authorized && !preview && /* @__PURE__ */ import_react3.default.createElement("p", { className: "small muted", role: "status" }, "\u98DE\u4E66\u6388\u6743\u5DF2\u5B8C\u6210\u3002\u70B9\u51FB\u300C\u8BFB\u53D6\u5999\u8BB0\u300D\u7EE7\u7EED\u3002"), auth?.error && /* @__PURE__ */ import_react3.default.createElement("p", { className: "mw-capture-warning", role: "alert" }, auth.error), preview && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("label", null, "\u4F1A\u8BAE\u540D\u79F0", /* @__PURE__ */ import_react3.default.createElement("input", { name: "minutesTitle", required: true, maxLength: 200, value: draft.minutesTitle, onChange: (e) => patch({ minutesTitle: e.target.value }) })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mw-fields" }, /* @__PURE__ */ import_react3.default.createElement("label", null, "\u4F1A\u8BAE\u65E5\u671F", /* @__PURE__ */ import_react3.default.createElement("input", { type: "date", name: "minutesDate", required: true, value: draft.minutesDate, onChange: (e) => patch({ minutesDate: e.target.value }) })), /* @__PURE__ */ import_react3.default.createElement("label", null, "\u6240\u5C5E\u9879\u76EE", projectSelect(draft.project, (project) => patch({ project })))), /* @__PURE__ */ import_react3.default.createElement("section", { className: "mw-minutes-preview", "aria-label": "\u5999\u8BB0\u9010\u5B57\u7A3F\u9884\u89C8" }, /* @__PURE__ */ import_react3.default.createElement("h3", null, "\u9010\u5B57\u7A3F\u9884\u89C8 ", /* @__PURE__ */ import_react3.default.createElement("small", null, "\u5171 ", preview.rows.length, " \u6BB5")), preview.rows.slice(0, 8).map((row) => /* @__PURE__ */ import_react3.default.createElement("article", { key: row.id }, /* @__PURE__ */ import_react3.default.createElement("strong", null, row.speaker, " \xB7 ", row.time), /* @__PURE__ */ import_react3.default.createElement("p", null, row.text.slice(0, 1200), row.text.length > 1200 ? "\u2026" : "")))), /* @__PURE__ */ import_react3.default.createElement("p", { className: "small muted" }, "\u786E\u8BA4\u540E\u4FDD\u5B58\u5B8C\u6574\u9010\u5B57\u7A3F\uFF0C\u5E76\u6309\u5DE5\u4F5C\u53F0\u73B0\u6709\u8BBE\u7F6E\u751F\u6210\u4F1A\u8BAE\u7EAA\u8981\u3002")));
}

// src/feishu-minutes.mjs
var FEISHU_MINUTES_SOURCE = "\u98DE\u4E66\u5999\u8BB0";
function saveMinutesMeeting(data, preview, { title, project, date }, id) {
  const existing = data.meetings.find((meeting2) => meeting2.source === FEISHU_MINUTES_SOURCE && meeting2.sourceId === preview.token);
  if (existing) return { id: existing.id, duplicate: true };
  const meeting = createMeeting(title, project, "", date);
  Object.assign(meeting, {
    id,
    source: FEISHU_MINUTES_SOURCE,
    sourceId: preview.token,
    sourceUrl: preview.url,
    importedAt: (/* @__PURE__ */ new Date()).toISOString(),
    transcript: preview.rows,
    participants: preview.participants,
    aiStatus: "\u7B49\u5F85\u6574\u7406"
  });
  data.meetings.unshift(meeting);
  return { id, duplicate: false };
}

// src/bulk-meetings.mjs
function selectMeetings(data, ids) {
  const wanted = new Set(ids);
  if (!wanted.size) throw Error("\u8BF7\u5148\u9009\u62E9\u4F1A\u8BAE");
  const meetings = data.meetings.filter((m) => wanted.has(m.id));
  if (meetings.length !== wanted.size) throw Error("\u90E8\u5206\u4F1A\u8BAE\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
  return meetings;
}
function removeMeetings(data, ids, protectedIds = []) {
  const meetings = selectMeetings(data, ids), blocked = new Set(protectedIds);
  if (meetings.some((m) => blocked.has(m.id))) throw Error("\u8BF7\u5148\u7ED3\u675F\u5E76\u4FDD\u5B58\u6240\u9009\u4F1A\u8BAE\u7684\u5F55\u97F3");
  const removed = new Set(meetings.map((m) => m.id));
  data.meetings = data.meetings.filter((m) => !removed.has(m.id));
  for (const [key, value] of Object.entries(data.assistant || {})) if (!key.startsWith("session:") && (removed.has(value?.meetingId) || key.startsWith("meeting:") && removed.has(key.slice(8)))) {
    if (value?.sessionId) data.assistant["session:" + value.sessionId] ||= { ...value };
    delete data.assistant[key];
  }
  return meetings.length;
}
function transcriptText(meeting, project, format = "txt") {
  const meta = `${meeting.date} \xB7 ${project || "\u672A\u5206\u7C7B"}`;
  const body = meetingTranscript(meeting).map((r) => `[${r.time}] ${r.speaker}\uFF1A${r.text}`).join("\n\n");
  return (format === "md" ? `# ${meeting.title}

${meta}

## \u9010\u5B57\u7A3F

` : `${meeting.title}
${meta}

`) + body + "\n";
}
var encoder = new TextEncoder();
function crc32(bytes) {
  let crc = 4294967295;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = crc >>> 1 ^ (crc & 1 ? 3988292384 : 0);
  }
  return (crc ^ 4294967295) >>> 0;
}
var record = (size) => {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
};
function storedZip(entries) {
  const local = [], central = [];
  let offset = 0;
  for (const { path, content } of entries) {
    const name = encoder.encode(path);
    const crc = crc32(content), head = record(30);
    head.view.setUint32(0, 67324752, true);
    head.view.setUint16(4, 20, true);
    head.view.setUint16(6, 2048, true);
    head.view.setUint32(14, crc, true);
    head.view.setUint32(18, content.length, true);
    head.view.setUint32(22, content.length, true);
    head.view.setUint16(26, name.length, true);
    head.view.setUint16(12, 33, true);
    const directory = record(46);
    directory.view.setUint32(0, 33639248, true);
    directory.view.setUint16(4, 20, true);
    directory.view.setUint16(6, 20, true);
    directory.view.setUint16(8, 2048, true);
    directory.view.setUint16(14, 33, true);
    directory.view.setUint32(16, crc, true);
    directory.view.setUint32(20, content.length, true);
    directory.view.setUint32(24, content.length, true);
    directory.view.setUint16(28, name.length, true);
    directory.view.setUint32(42, offset, true);
    local.push(head.bytes, name, content);
    central.push(directory.bytes, name);
    offset += 30 + name.length + content.length;
  }
  const centralSize = central.reduce((n, x) => n + x.length, 0), end = record(22);
  end.view.setUint32(0, 101010256, true);
  end.view.setUint16(8, entries.length, true);
  end.view.setUint16(10, entries.length, true);
  end.view.setUint32(12, centralSize, true);
  end.view.setUint32(16, offset, true);
  const bytes = new Uint8Array(offset + centralSize + 22);
  let at = 0;
  for (const chunk of [...local, ...central, end.bytes]) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return bytes;
}
function transcriptArchive(data, ids, format = "txt") {
  if (!["txt", "md"].includes(format)) throw Error("\u4E0D\u652F\u6301\u7684\u9010\u5B57\u7A3F\u683C\u5F0F");
  const selected = selectMeetings(data, ids), meetings = selected.filter((m) => meetingTranscript(m).some((r) => r.text.trim()));
  if (!meetings.length) throw Error("\u6240\u9009\u4F1A\u8BAE\u6682\u65E0\u53EF\u5BFC\u51FA\u7684\u9010\u5B57\u7A3F");
  const safe = (s) => String(s || "").replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g, "-").replace(/^\.+/, "").trim().slice(0, 80) || "\u4F1A\u8BAE";
  let total = 0;
  const entries = meetings.map((m) => {
    const path = `${safe(m.date)}_${safe(m.title)}_${safe(m.id)}.${format}`;
    const content = encoder.encode("\uFEFF" + transcriptText(m, data.projects.find((p) => p.id === m.project)?.name, format));
    total += content.length;
    if (total > 100 * 1024 * 1024) throw Error("\u9010\u5B57\u7A3F\u603B\u91CF\u8D85\u8FC7 100 MB\uFF0C\u8BF7\u5206\u6279\u5BFC\u51FA");
    return { path, content };
  });
  return { bytes: storedZip(entries), count: meetings.length, skipped: selected.length - meetings.length };
}

// src/minutes-export.mjs
var WORD_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
var WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
var REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
var OFFICE_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
var XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
var encoder2 = new TextEncoder();
function plain(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
}
function xmlText(text) {
  return text.replace(/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/gu, "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
}
function readLines(markdownText) {
  return markdownText.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) return { style: heading[1].length === 1 ? "Title" : heading[1].length === 2 ? "Heading1" : "Heading2", text: plain(heading[2]) };
    const list = line.match(/^\s*[-*]\s+(.*)$/);
    if (list) return { style: "ListParagraph", text: "\u2022 " + plain(list[1].replace(/^\[x\]\s/i, "\uFF3B\u5DF2\u5B8C\u6210\uFF3D").replace(/^\[ \]\s/, "\uFF3B\u5F85\u8DDF\u8FDB\uFF3D")) };
    return { style: "Normal", text: plain(line) };
  });
}
function stylesXml() {
  const font = '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="PingFang SC"/>';
  const style = (id, name, size, pPr, bold = false) => `<w:style w:type="paragraph" w:styleId="${id}"${id === "Normal" ? ' w:default="1"' : ""}><w:name w:val="${name}"/>${id === "Normal" ? "" : '<w:basedOn w:val="Normal"/>'}<w:pPr>${pPr}</w:pPr><w:rPr>${font}${bold ? "<w:b/>" : ""}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:style>`;
  return XML + `<w:styles xmlns:w="${WORD_NS}">` + style("Normal", "Normal", 22, '<w:spacing w:after="125" w:line="300" w:lineRule="auto"/>') + style("Title", "Title", 42, '<w:keepNext/><w:spacing w:after="180"/>', true) + style("Heading1", "heading 1", 28, '<w:keepNext/><w:spacing w:before="280" w:after="120"/><w:outlineLvl w:val="0"/>', true) + style("Heading2", "heading 2", 24, '<w:keepNext/><w:spacing w:before="160" w:after="90"/><w:outlineLvl w:val="1"/>', true) + style("ListParagraph", "List Paragraph", 22, '<w:spacing w:after="90"/><w:ind w:left="270" w:hanging="180"/>') + "</w:styles>";
}
function docx(lines) {
  const paragraphs = lines.map(({ style, text }) => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t xml:space="preserve">${xmlText(text)}</w:t></w:r></w:p>`).join("");
  const entries = {
    "[Content_Types].xml": XML + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    "_rels/.rels": XML + `<Relationships xmlns="${REL_NS}"><Relationship Id="rId1" Type="${OFFICE_REL}officeDocument" Target="word/document.xml"/></Relationships>`,
    "word/_rels/document.xml.rels": XML + `<Relationships xmlns="${REL_NS}"><Relationship Id="rId1" Type="${OFFICE_REL}styles" Target="styles.xml"/></Relationships>`,
    "word/styles.xml": stylesXml(),
    "word/document.xml": XML + `<w:document xmlns:w="${WORD_NS}"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1230" w:right="1320" w:bottom="1230" w:left="1320" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>`
  };
  return storedZip(Object.entries(entries).map(([path, text]) => ({ path, content: encoder2.encode(text) })));
}
function minutesFile(meeting, project, format) {
  const name = meeting.title.replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g, "-").replace(/^\.+/, "").trim().slice(0, 100) || "\u4F1A\u8BAE\u7EAA\u8981";
  const source = markdown(meeting, project);
  if (format === "md") return { name: name + ".md", type: "text/markdown;charset=utf-8", content: source };
  const lines = readLines(source);
  if (format === "docx") return { name: name + ".docx", type: WORD_MIME, content: docx(lines) };
  if (format === "txt") {
    const text = lines.map(({ style, text: text2 }, i) => i > 0 && (style === "Heading1" || style === "Heading2") ? "\r\n" + text2 : text2).join("\r\n");
    return { name: name + ".txt", type: "text/plain;charset=utf-8", content: "\uFEFF" + text + "\r\n" };
  }
  throw Error("\u4E0D\u652F\u6301\u7684\u7EAA\u8981\u683C\u5F0F");
}

// src/client/meeting-summary.jsx
var import_react4 = __toESM(require("react"), 1);
function inline(line) {
  return line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? /* @__PURE__ */ import_react4.default.createElement("strong", { key: i }, part.slice(2, -2)) : part.startsWith("`") && part.endsWith("`") ? /* @__PURE__ */ import_react4.default.createElement("code", { key: i }, part.slice(1, -1)) : part);
}
function SummaryText({ text }) {
  const blocks = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; ) {
    const line = lines[i++].trim();
    if (!line) continue;
    if (/^#{1,6}\s/.test(line)) {
      blocks.push(/* @__PURE__ */ import_react4.default.createElement("h3", { key: i }, inline(line.replace(/^#+\s+/, ""))));
      continue;
    }
    const parts = (value) => value.trim().replace(/^\||\|$/g, "").split("|").map((s) => s.trim());
    if (line.includes("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i] || "")) {
      const header = parts(line), rows = [], key = i++;
      while (lines[i]?.trim().includes("|")) rows.push(parts(lines[i++]));
      blocks.push(/* @__PURE__ */ import_react4.default.createElement("div", { className: "mw-summary-table", key }, /* @__PURE__ */ import_react4.default.createElement("table", null, /* @__PURE__ */ import_react4.default.createElement("thead", null, /* @__PURE__ */ import_react4.default.createElement("tr", null, header.map((s, j) => /* @__PURE__ */ import_react4.default.createElement("th", { key: j }, inline(s))))), /* @__PURE__ */ import_react4.default.createElement("tbody", null, rows.map((row, j) => /* @__PURE__ */ import_react4.default.createElement("tr", { key: j }, header.map((_, k) => /* @__PURE__ */ import_react4.default.createElement("td", { key: k }, inline(row[k] || "")))))))));
      continue;
    }
    const pattern = /^(?:[-*•]\s+|\d+[.)、]\s*)/;
    if (pattern.test(line)) {
      const key = i, items = [line.replace(pattern, "")];
      while (pattern.test(lines[i]?.trim() || "")) items.push(lines[i++].trim().replace(pattern, ""));
      const Tag = /^\d/.test(line) ? "ol" : "ul";
      blocks.push(/* @__PURE__ */ import_react4.default.createElement(Tag, { key }, items.map((item, j) => /* @__PURE__ */ import_react4.default.createElement("li", { key: j }, inline(item)))));
      continue;
    }
    const label = line.match(/^(主题|背景|进展|结论|待确认)[：:]\s*(.*)$/);
    blocks.push(label ? /* @__PURE__ */ import_react4.default.createElement("p", { key: i }, /* @__PURE__ */ import_react4.default.createElement("strong", null, label[1], "\u3000"), inline(label[2])) : /* @__PURE__ */ import_react4.default.createElement("p", { key: i }, inline(line)));
  }
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "mw-summary-text" }, blocks);
}
function MeetingSummary({ meeting, onLocate }) {
  const diagram = meeting.summaryDiagram;
  const pending = meeting.aiStatus === "\u7B49\u5F85 AI \u6A21\u578B" ? "\u5728 DSH \u9009\u62E9\u6A21\u578B\u540E\u4F1A\u81EA\u52A8\u6574\u7406\u3002" : ["\u7B49\u5F85\u6574\u7406", "\u6574\u7406\u4E2D", "\u8F6C\u5199\u4E2D"].includes(meeting.aiStatus) ? "\u6B63\u5728\u51C6\u5907\u4F1A\u8BAE\u6458\u8981\u2026" : meeting.aiStatus === "\u6574\u7406\u5931\u8D25" ? "\u6458\u8981\u751F\u6210\u672A\u5B8C\u6210\uFF0C\u8BE6\u60C5\u89C1\u4E0A\u65B9\u63D0\u793A\u3002" : meeting.transcript.length ? "\u4F1A\u540E\u81EA\u52A8\u751F\u6210\u4F1A\u8BAE\u6458\u8981\u3002" : "\u8BC6\u522B\u51FA\u9010\u5B57\u7A3F\u540E\u4F1A\u81EA\u52A8\u6574\u7406\u3002";
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "mw-summary-reader" }, meeting.summary ? /* @__PURE__ */ import_react4.default.createElement(SummaryText, { text: meeting.summary }) : /* @__PURE__ */ import_react4.default.createElement("p", { className: "muted" }, pending), Array.isArray(diagram?.steps) && diagram.steps.length > 1 && /* @__PURE__ */ import_react4.default.createElement("details", { className: "mw-summary-diagram" }, /* @__PURE__ */ import_react4.default.createElement("summary", null, diagram.title, " \xB7 ", diagram.type === "flow" ? "\u6D41\u7A0B\u56FE" : diagram.type === "timeline" ? "\u65F6\u95F4\u7EBF" : "\u8BAE\u9898\u7ED3\u6784"), /* @__PURE__ */ import_react4.default.createElement("ol", { className: "mw-diagram-steps " + (diagram.type === "topics" ? "topics" : "ordered") }, diagram.steps.map((step, i) => {
    const index = meeting.transcript.findIndex((r) => r.id === step.paragraphId);
    return /* @__PURE__ */ import_react4.default.createElement("li", { key: i }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "mw-diagram-number" }, i + 1), /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("strong", null, step.title), /* @__PURE__ */ import_react4.default.createElement("p", null, step.detail), index >= 0 && /* @__PURE__ */ import_react4.default.createElement("button", { className: "link", onClick: () => onLocate(index) }, "\u67E5\u770B\u539F\u6587 \xB7 ", meeting.transcript[index].time)));
  }))));
}

// src/client/main.jsx
var import_react19 = __toESM(require("react"), 1);

// src/client/style.css
var style_default = `.meeting-workspace{--mw-purple:#6048c7;--mw-line:#e5e7ef;--mw-muted:#626879;--mw-surface:#fff;--mw-canvas:#f5f6f9;color:#202331;background:var(--mw-canvas);font:13px -apple-system,BlinkMacSystemFont,'PingFang SC','Segoe UI',sans-serif;container-type:inline-size;position:relative;isolation:isolate;min-height:0;min-width:0;max-width:100%;width:100%;height:100%;flex:1;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box}.meeting-workspace *:not(.mw-host-conversation *){box-sizing:border-box}.meeting-workspace button:not(.mw-host-conversation *),.meeting-workspace input:not(.mw-host-conversation *),.meeting-workspace select:not(.mw-host-conversation *),.meeting-workspace textarea:not(.mw-host-conversation *){font:inherit}.meeting-workspace button:not(.mw-host-conversation *){border:1px solid var(--mw-line);background:#fff;color:#545969;border-radius:7px;padding:8px 12px;cursor:pointer;white-space:nowrap;flex-shrink:0}.meeting-workspace button:hover:not(.mw-host-conversation *){background:#f4f0ff}.meeting-workspace button:disabled:not(.mw-host-conversation *){opacity:.45;cursor:not-allowed}.meeting-workspace button.primary:not(.mw-host-conversation *){background:var(--mw-purple);color:white;border-color:var(--mw-purple)}.meeting-workspace .link:not(.mw-host-conversation *){border:0;background:none;padding:4px;color:var(--mw-purple);white-space:normal;text-align:left}.meeting-workspace .danger:not(.mw-host-conversation *){color:#b76b6b}.meeting-workspace input:not(.mw-host-conversation *),.meeting-workspace select:not(.mw-host-conversation *),.meeting-workspace textarea:not(.mw-host-conversation *){border:1px solid #e2e4ec;border-radius:7px;padding:9px 11px;background:#fff;min-width:0;color:inherit;max-width:100%}.meeting-workspace textarea:not(.mw-host-conversation *){width:100%;min-height:140px;resize:vertical;line-height:1.9}.meeting-workspace textarea.large:not(.mw-host-conversation *){min-height:300px}.meeting-workspace input[type=checkbox]:not(.mw-host-conversation *){accent-color:var(--mw-purple);width:15px;height:15px;flex-shrink:0;vertical-align:middle}.meeting-workspace :focus-visible:not(.mw-host-conversation *){outline:2px solid #a28ae6;outline-offset:2px}.meeting-workspace h1:not(.mw-host-conversation *),.meeting-workspace h2:not(.mw-host-conversation *),.meeting-workspace h3:not(.mw-host-conversation *),.meeting-workspace p:not(.mw-host-conversation *){margin-top:0;overflow-wrap:anywhere}.meeting-workspace h1:not(.mw-host-conversation *){font-size:26px;line-height:1.5;letter-spacing:-.6px;margin-bottom:7px}.meeting-workspace h2:not(.mw-host-conversation *){font-size:15px;margin:0}.meeting-workspace h3:not(.mw-host-conversation *){font-size:14px;margin:0 0 10px}.meeting-workspace p:not(.mw-host-conversation *){line-height:1.9}.meeting-workspace .muted:not(.mw-host-conversation *),.meeting-workspace small:not(.mw-host-conversation *){color:var(--mw-muted)}.meeting-workspace .small:not(.mw-host-conversation *){font-size:11px}.mw-nav{background:white;border-bottom:1px solid var(--mw-line);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 25px;flex-wrap:wrap;flex-shrink:0}.mw-nav [role=tablist]{display:flex;gap:7px;flex-shrink:0}.mw-nav [role=tab]{border:0;font-weight:500;color:#9699a4}.mw-nav [role=tab].active{background:#f0ebfc;color:var(--mw-purple)}.mw-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.mw-tools input{width:180px;font-size:11px;background:#f8f9fb}.mw-tools select,.mw-tools button{font-size:11px}.mw-frame{display:flex;flex:1;min-width:0;min-height:0;overflow:hidden}.mw-content{padding:30px;overflow:auto;min-width:0;flex:1}.mw-heading{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:5px 0 27px}.mw-heading>div:first-child{min-width:0}.mw-heading small{font-size:9px;letter-spacing:1.6px}.mw-heading p{font-size:11px;color:var(--mw-muted);margin-bottom:0}.meeting-workspace .actions:not(.mw-host-conversation *){display:flex;gap:8px;flex-wrap:wrap;align-items:center}.mw-card{border:1px solid var(--mw-line);border-radius:11px;background:white;min-width:0;overflow:hidden}.mw-card-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:20px 23px}.mw-card-head select{font-size:11px}.mw-meeting{display:flex!important;width:100%;gap:15px;padding:22px!important;border:0!important;border-top:1px solid #f0f1f5!important;border-radius:0!important;white-space:normal!important;text-align:left;align-items:center}.mw-meeting-body{min-width:0;flex:1}.mw-meeting h3{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.mw-meeting .muted{font-size:10px;line-height:1.8}.mw-meeting p{font-size:11px;color:var(--mw-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;margin:9px 0 0}.mw-file-icon{background:#f5f2fc;color:#9b87c7;padding:12px;border-radius:9px;flex-shrink:0}.mw-meeting .arrow{font-size:22px;color:#b8b4c5}.meeting-workspace .badge:not(.mw-host-conversation *){font-size:9px;font-weight:400;border-radius:4px;padding:4px 7px;background:#f2eefb;color:#9b87c7;white-space:nowrap}.meeting-workspace .empty:not(.mw-host-conversation *){color:#a6a8b4;font-size:12px;text-align:center;padding:65px 20px;line-height:2.2}.mw-welcome{display:flex;justify-content:space-between;gap:15px;align-items:center;border:1px solid #e7dff9;background:#faf8ff;padding:20px;margin-bottom:25px;border-radius:10px}.mw-welcome p{color:#9b91ae;font-size:11px;margin:8px 0 0}.mw-error,.mw-notice{padding:12px 25px;font-size:12px;line-height:1.8;overflow-wrap:anywhere;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:10px}.mw-error{background:#fff0f0;color:#a85d5d}.mw-notice{background:#f0ebfc;color:#8f7bb5}.mw-detail{display:grid;grid-template-columns:minmax(0,1fr) minmax(230px,31%);gap:23px;align-items:start}.mw-tabs{display:flex;gap:10px;border-bottom:1px solid var(--mw-line);padding:8px 17px 0;flex-wrap:wrap}.mw-tabs button{border:0;border-radius:0;padding:13px 6px;color:#9b9daa}.mw-tabs .active{color:var(--mw-purple);border-bottom:2px solid var(--mw-purple)}.mw-document{padding:23px}.mw-document .mw-card-head{padding:13px 0 17px}.mw-document>textarea{margin-bottom:20px}.mw-decision{padding:14px;background:#faf8ff;border-radius:7px;margin-bottom:10px}.mw-decision p{font-size:12px;margin-bottom:8px;white-space:pre-wrap}.mw-source>input{margin:0 20px 10px;width:calc(100% - 40px);font-size:11px}.mw-transcript{padding:0 22px;overflow:auto;max-height:620px}.mw-transcript article{padding:16px 0;border-bottom:1px solid #f0f1f4}.mw-transcript article header{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:10px;color:#a28ab9}.mw-transcript article strong{font-weight:500}.mw-transcript article p{font-size:12px;white-space:pre-wrap;margin:8px 0 0;color:#7a8090}.mw-transcript article.highlight{background:#f2eafe;outline:8px solid #f2eafe;border-radius:5px}.mw-table{overflow-x:auto;max-width:100%;min-width:0}.mw-table table{width:100%;border-collapse:collapse;min-width:480px}.mw-table th,.mw-table td{text-align:left;padding:15px 17px;font-size:11px;border-bottom:1px solid #f0f1f5;vertical-align:top;overflow-wrap:anywhere}.mw-table th{font-size:10px;font-weight:400;color:#a0a5b0;white-space:nowrap}.mw-table td:first-child{min-width:170px;max-width:440px}.mw-table td label{display:flex;align-items:flex-start;gap:10px;line-height:1.8}.mw-table td button{font-size:10px;padding:5px 7px}.mw-table .done{text-decoration:line-through;color:#adb1bb}.mw-table .overdue{color:#bc855c}.mw-filter-row{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:18px}.mw-filter-row select{font-size:11px}.mw-audio{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}.mw-audio span{font-size:11px;color:#9895a4;overflow-wrap:anywhere;flex:1;min-width:80px}.mw-audio button{font-size:10px}.meeting-workspace audio:not(.mw-host-conversation *){width:100%;height:36px;margin-top:12px}.mw-ask{max-width:760px;margin:auto;padding:30px}.mw-ask>h2{margin-bottom:22px}.mw-ask label{display:flex;align-items:center;gap:18px;margin-bottom:18px;font-size:12px}.mw-ask select{max-width:80%}.mw-ask p{font-size:12px}.mw-conversation{min-width:300px;width:40%;max-width:55%;min-height:0;display:flex;flex-direction:column;border-left:1px solid var(--mw-line);background:#fff;overflow:hidden}.mw-conversation>header{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px;font-size:11px;border-bottom:1px solid var(--mw-line);flex-shrink:0}.mw-conversation>header button{font-size:10px}.mw-conversation>div{min-height:0;min-width:0;flex:1;max-width:100%}.mw-overlay{position:absolute;inset:0;z-index:50;background:#30263f66;backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}.mw-dialog{background:#fff;width:580px;max-width:100%;max-height:100%;overflow:auto;border-radius:14px;padding:25px;box-shadow:0 20px 70px #2e244333;flex-shrink:0}.mw-dialog>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:15px}.mw-dialog>header h2{font-size:20px}.mw-dialog>header button{border:0;font-size:22px;padding:0 7px}.mw-dialog>label,.mw-fields>label{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;font-size:12px;color:#848896}.mw-fields{display:flex;gap:14px}.mw-fields>*{flex:1;min-width:0}.mw-dialog>label.inline{flex-direction:row;align-items:center}.mw-dialog>footer{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.mw-upload{border:1px dashed #d8ccef;border-radius:9px;background:#faf8fe;padding:18px;align-items:center}.mw-upload input{max-width:100%;font-size:11px}.mw-upload small{font-size:10px}.mw-setting{padding:0 0 20px;border-bottom:1px solid var(--mw-line);margin-bottom:20px}.mw-setting b{font-size:13px}.mw-setting p{font-size:11px;color:#9096a3;margin:10px 0;overflow-wrap:anywhere}.mw-project{display:flex;gap:8px;align-items:center;margin:12px 0}.mw-project span{flex:1;font-size:12px}.mw-project button{font-size:10px;padding:6px}.mw-file-button{display:inline-flex;padding:9px 12px;border:1px solid var(--mw-line);border-radius:7px;font-size:12px;cursor:pointer}.mw-file-button input{display:none}.mw-live{background:white;border:1px solid #e4dbf5;border-radius:12px;padding:23px;margin-bottom:25px}.mw-live-head{display:flex;justify-content:space-between;gap:15px}.mw-live h2{margin-top:12px;overflow-wrap:anywhere}.mw-live p{font-size:11px;margin:9px 0}.mw-live .clock{font-size:27px;color:var(--mw-purple);font-variant-numeric:tabular-nums}.mw-meter{height:5px;border-radius:5px;background:#f1edf7;overflow:hidden;margin:15px 0 8px}.mw-meter i{display:block;height:100%;background:#a48ce3;transition:width .2s}.mw-live-text{background:#fcfaff;border-radius:8px;padding:12px 16px;max-height:180px;overflow:auto;margin:15px 0}.mw-live-text p{white-space:pre-wrap;color:#7a8090}.mw-live-text small{font-size:9px;color:#aa9abc}@container(max-width:1050px){.mw-detail{grid-template-columns:minmax(0,1fr) 260px}.mw-nav{padding:12px 18px;gap:8px}.mw-tools input{width:155px}.mw-content{padding:25px}.mw-heading{align-items:flex-start}.mw-heading .actions{justify-content:flex-end;max-width:340px}.mw-document{padding:18px}.mw-table td,.mw-table th{padding:13px 12px}}@container(max-width:820px){.mw-detail{grid-template-columns:minmax(0,1fr)}.mw-source .mw-transcript{max-height:340px}.mw-conversation{width:100%;max-width:100%;min-width:0;min-height:420px;border-left:0;border-top:1px solid var(--mw-line)}.mw-frame.with-conversation{flex-direction:column;overflow:auto}.with-conversation .mw-content{overflow:visible;flex:none}.with-conversation .mw-conversation{flex:none;height:65vh}.mw-tools{flex:1;justify-content:flex-end}.mw-heading{flex-wrap:wrap}.mw-heading .actions{max-width:none;justify-content:flex-start}.mw-welcome{align-items:flex-start;flex-wrap:wrap}.mw-dialog{padding:22px}}@container(max-width:560px){.mw-content{padding:20px 14px}.mw-nav{padding:10px 12px}.mw-nav [role=tab]{padding:8px;font-size:12px}.mw-tools{justify-content:flex-start}.mw-tools input{flex:1;width:120px}.mw-tools select{max-width:130px}.mw-heading h1{font-size:23px}.mw-heading p{line-height:1.9}.mw-file-icon{display:none}.mw-meeting{padding:18px!important}.mw-meeting h3{font-size:13px}.mw-meeting p{max-width:100%}.mw-card-head{padding:17px}.mw-overlay{padding:10px}.mw-dialog{padding:18px}.mw-dialog>header h2{font-size:18px}.mw-fields{flex-direction:column;gap:0}.mw-document{padding:16px}.mw-live{padding:18px}.mw-ask{padding:22px}.mw-dialog footer{flex-wrap:wrap}}
/* Preserve readable business columns; only the table scrolls in narrow containers. */
.meeting-workspace .mw-table table{min-width:660px}.meeting-workspace .mw-table:not(.mw-editable-tasks) td:first-child{min-width:260px}.meeting-workspace .mw-table:not(.mw-editable-tasks) td:nth-child(2){min-width:110px}.meeting-workspace .mw-table:not(.mw-editable-tasks) td:nth-child(3){min-width:112px;white-space:nowrap}.meeting-workspace .mw-table:not(.mw-editable-tasks) td:last-child{min-width:115px;white-space:nowrap}

/* Time-history of real microphone RMS; no simulated animation or volume slider. */
.mw-waveform{height:72px;display:flex;justify-content:center;align-items:center;gap:5px;max-width:300px;margin:18px auto 6px}.mw-waveform i{display:block;width:4px;flex-shrink:0;min-height:4px;border-radius:6px;background:#a58ae8;transition:height 90ms ease-out}@media(prefers-reduced-motion:reduce){.mw-waveform i{transition:none}}

/* Credential form follows its own container, including narrow workbench panels. */
.mw-speech-settings>b{display:block;margin-bottom:14px}.mw-speech-settings label{display:flex;flex-direction:column;gap:7px;margin:12px 0;min-width:0}.mw-speech-settings input,.mw-speech-settings select{width:100%;min-width:0}.mw-speech-settings p{margin-bottom:12px}

.mw-interim{color:#8f95a3;font-style:italic}.mw-live-text small{color:#6c53d7}

.mw-project-picker{display:flex;flex-direction:column;gap:10px}.mw-project-picker select{flex:1;min-width:120px}.mw-project-picker input{flex:1;min-width:140px}.mw-project-picker .actions{gap:6px}.mw-dialog .mw-project-picker button{font-size:11px}

.mw-source-status{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.mw-source-status span{font-size:11px;padding:6px 10px;background:#f5f2fc;border-radius:6px;color:#725ca6}

.mw-capture-warning{padding:10px 12px;background:#fff7e9;color:#947348;border-radius:7px;font-size:12px}

.mw-bulk-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 23px;background:#faf9fd;border-bottom:1px solid var(--mw-line);min-height:57px}.mw-select-all{display:flex;align-items:center;gap:12px;font-size:12px;white-space:nowrap;cursor:pointer}.meeting-workspace input.mw-circle-check{appearance:none;-webkit-appearance:none;display:inline-block;position:relative;width:20px;height:20px;min-width:20px;padding:0;margin:0;border:1.5px solid #c7c4d2;border-radius:50%;background:#fff;cursor:pointer;flex-shrink:0}.meeting-workspace input.mw-circle-check:checked,.meeting-workspace input.mw-circle-check:indeterminate{background:var(--mw-purple);border-color:var(--mw-purple)}.mw-circle-check:checked::after{content:'';position:absolute;left:6px;top:3px;width:5px;height:9px;border:solid white;border-width:0 2px 2px 0;transform:rotate(45deg)}.mw-circle-check:indeterminate::after{content:'';position:absolute;left:4px;top:8px;width:9px;border-top:2px solid white}.meeting-workspace input.mw-circle-check:disabled{opacity:.4;cursor:not-allowed}.meeting-workspace input.mw-circle-check:focus-visible{outline:3px solid #bda8f4;outline-offset:3px}.mw-meeting-row{display:flex;align-items:stretch;border-bottom:1px solid var(--mw-line);min-width:0}.mw-meeting-row:last-child{border-bottom:0}.mw-meeting-row.is-selected{background:#f6f2ff}.mw-meeting-pick{display:flex;align-items:center;padding:0 0 0 23px;cursor:pointer;flex-shrink:0}.mw-meeting-row .mw-meeting{flex:1;min-width:0;border-bottom:0!important;background:transparent}.mw-bulk-toolbar .actions{gap:7px}.mw-bulk-toolbar button,.mw-bulk-toolbar select{font-size:11px;white-space:nowrap}.mw-delete-list{max-height:190px;overflow:auto;margin:15px 0;padding-left:23px;font-size:12px;line-height:1.9;overflow-wrap:anywhere}
@container(max-width:560px){.mw-bulk-toolbar{padding:12px 17px}.mw-bulk-toolbar>.actions{width:100%;justify-content:flex-start;flex-wrap:wrap}.mw-meeting-pick{padding-left:17px}.mw-meeting-row .mw-meeting{padding-left:12px!important}}

.mw-plan{padding:24px;border-bottom:1px solid var(--mw-line)}.mw-plan:last-child{border:0}.mw-plan header{display:flex;align-items:center;justify-content:space-between;gap:12px}.mw-plan h2{overflow-wrap:anywhere}.mw-plan-time{font-size:12px;color:#8d869e;margin:12px 0}.mw-plan-agenda{font-size:13px;line-height:1.8;white-space:pre-wrap;margin:12px 0}.mw-plan-link{display:inline-block;margin-bottom:14px;color:var(--mw-purple);font-size:12px}.mw-plan-filter{display:flex;gap:8px;align-items:center;font-size:12px}.mw-nav [role=tablist]{flex-wrap:wrap}@container(max-width:560px){.mw-plan{padding:18px}.mw-plan .actions{flex-wrap:wrap}.mw-plan header{align-items:flex-start}}

.mw-calendar-panel{margin-bottom:20px}.mw-calendar-list{display:flex;flex-direction:column;gap:10px;margin:15px 0}.mw-calendar-list label{display:flex;align-items:center;gap:10px;font-size:12px}.mw-calendar-list small{display:block;color:#9a94a5;margin-top:3px}.mw-generated-summary{margin:12px 0;font-size:12px}.mw-generated-summary p{white-space:pre-wrap;line-height:1.8;margin-top:10px}

.mw-chat-content{padding:0!important;display:flex;flex-direction:column;overflow:hidden}.mw-assistant-page{display:flex;flex-direction:column;min-height:0;min-width:0;flex:1;background:#fff}.mw-assistant-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 25px;border-bottom:1px solid var(--mw-line);flex-shrink:0}.mw-assistant-heading>div:first-child{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.mw-assistant-heading h1{font-size:20px;margin:0}.mw-assistant-scope{font-size:11px;color:#8d839e;background:#f5f1fc;padding:6px 10px;border-radius:20px}.mw-assistant-body{flex:1;display:flex;min-width:0;min-height:0}.mw-native-thread{flex:1;display:flex;min-width:0;min-height:0;overflow:hidden}.mw-host-conversation{flex:1;min-width:0;min-height:0;height:100%;display:flex;flex-direction:column;overflow:hidden}.mw-host-conversation>div{min-height:0;min-width:0;flex:1}.mw-assistant-welcome{margin:auto;max-width:620px;padding:32px;display:flex;align-items:center;flex-direction:column;gap:18px;text-align:center}.mw-assistant-symbol{font-size:30px;color:var(--mw-purple);background:#f1ebff;border-radius:18px;width:64px;height:64px;display:grid;place-items:center}.mw-assistant-welcome h2{font-size:22px}.mw-assistant-welcome p{font-size:12px;color:var(--mw-muted);margin:0}.mw-question-examples{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.mw-question-examples span{padding:9px 12px;border:1px solid var(--mw-line);border-radius:8px;font-size:11px;color:#8d879a}.mw-assistant-sources{width:280px;flex-shrink:0;border-left:1px solid var(--mw-line);background:#faf9fc;overflow:auto;min-width:0;padding:18px 14px}.mw-assistant-sources>h2{font-size:13px;margin-bottom:15px}.meeting-workspace button.mw-source-hit{display:block;width:100%;margin-bottom:10px;padding:12px;text-align:left;white-space:normal;overflow-wrap:anywhere}.mw-source-hit strong{font-size:12px;display:block;line-height:1.6}.mw-source-hit small{display:block;margin-top:7px;font-size:10px;line-height:1.6}.mw-source-hit p{font-size:11px;color:#8f8a9b;line-height:1.8;margin:8px 0 0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}@container(max-width:820px){.mw-assistant-body{flex-direction:column}.mw-assistant-sources{width:100%;max-height:30%;flex-shrink:1;border-left:0;border-top:1px solid var(--mw-line)}.mw-assistant-heading{padding:14px 18px}.mw-native-thread{min-height:0}}@container(max-width:560px){.mw-assistant-heading{align-items:flex-start;flex-wrap:wrap}.mw-assistant-welcome{padding:24px 18px}.mw-assistant-welcome h2{font-size:19px}.mw-assistant-heading .actions{width:100%;justify-content:flex-end}.mw-assistant-sources{max-height:min(180px,30%)}}

/* Meeting and task overview on the workbench home. */
.mw-assistant-compact .mw-assistant-heading{padding:10px 14px;gap:8px}.mw-assistant-compact .mw-assistant-heading h1{display:none}.mw-assistant-compact .mw-assistant-heading button{font-size:10px;padding:6px 8px}.mw-assistant-compact .mw-assistant-scope{font-size:10px}.mw-assistant-compact .mw-assistant-welcome{gap:14px;padding:22px 18px}.mw-assistant-compact .mw-assistant-welcome h2{font-size:17px}.mw-assistant-compact .mw-assistant-symbol{width:42px;height:42px;border-radius:13px;font-size:23px}.mw-assistant-compact .mw-question-examples span{font-size:10px;padding:7px}.mw-assistant-compact .mw-assistant-body{flex-direction:column}.mw-assistant-compact .mw-assistant-sources{width:100%;max-height:100px;padding:10px;border-left:0;border-top:1px solid var(--mw-line)}
/* Meetings are collected by their existing business project, within the host frame. */
.mw-records-count{font-size:12px;color:var(--mw-muted);margin:0 0 15px;overflow-wrap:anywhere}.mw-records-list>.mw-bulk-toolbar{border:1px solid var(--mw-line);border-radius:10px;margin-bottom:17px}.mw-project-meetings{margin-bottom:20px}.mw-project-meetings>.mw-card-head>div{display:flex;align-items:center;gap:10px;min-width:0;flex-wrap:wrap}.mw-project-meetings>.mw-card-head svg{color:#9680cc;flex-shrink:0}.mw-project-meetings h2{overflow-wrap:anywhere;line-height:1.6}.mw-project-meetings .mw-card-head small{white-space:nowrap}.mw-project-meetings .mw-meeting-body{min-width:0}
@container(max-width:560px){.mw-project-meetings>.mw-card-head{padding:16px}}


/* Navigation and long project options must shrink inside the business container. */
.mw-nav>[role=tablist]{min-width:0;max-width:100%;flex-shrink:1;flex-wrap:wrap}.mw-tools{min-width:0;max-width:100%}.mw-tools input{min-width:100px;max-width:100%}.mw-tools select{min-width:0;max-width:200px}@container(max-width:560px){.mw-tools select{max-width:130px}}

.meeting-workspace .mw-tools select{max-width:200px}.meeting-workspace .mw-tools input{max-width:200px}@container(max-width:560px){.meeting-workspace .mw-tools select{max-width:130px}}

/* Settings storage is a contained, scrollable list, with an explicit destructive confirmation. */
.mw-storage-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.mw-storage-heading h3{font-size:16px;margin:0}.mw-storage-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:20px 0}.mw-storage-stats>div{display:flex;flex-direction:column;gap:7px;background:#f7f4fd;padding:14px;border-radius:10px;min-width:0}.mw-storage-stats strong{font-size:23px;color:var(--mw-purple);white-space:nowrap}.mw-storage-stats span{font-size:11px;color:var(--mw-muted)}.mw-retention{display:flex;flex-direction:column;gap:8px;max-width:260px}.mw-storage-filter,.mw-storage-selection{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin:16px 0}.mw-storage-filter>input{flex:1;min-width:130px}.mw-storage .inline{display:flex;align-items:center;gap:7px;margin:0;font-size:12px}.mw-storage-list{max-height:330px;overflow:auto;overscroll-behavior:contain;border-top:1px solid var(--mw-line)}.mw-storage-row{display:flex;gap:12px;justify-content:space-between;padding:15px 0;border-bottom:1px solid var(--mw-line);align-items:center}.mw-storage-pick{display:flex;align-items:flex-start;gap:10px;min-width:0;flex:1}.mw-storage-pick>input{flex-shrink:0;margin-top:4px}.mw-storage-pick>span{min-width:0}.mw-storage-pick strong{display:block;font-size:12px;line-height:1.7;overflow-wrap:anywhere}.mw-storage-pick small{display:block;font-size:10px;color:var(--mw-muted);line-height:1.8}.mw-storage-row .actions{flex-shrink:0}.mw-storage-row button{font-size:11px;padding:7px 10px}.mw-storage-confirm{border:1px solid #e9c7cc;border-radius:10px;background:#fffafa;padding:17px;margin:16px 0}.mw-storage-confirm h4{margin:0;font-size:14px}.mw-storage-confirm p,.mw-storage-confirm li{font-size:12px;line-height:1.8;overflow-wrap:anywhere}.mw-storage-confirm ul{max-height:130px;overflow:auto;padding-left:20px}.mw-storage-notice{color:var(--mw-purple);font-size:12px}.mw-storage button:disabled{opacity:.45;cursor:not-allowed}
@container(max-width:560px){.mw-storage-stats{gap:6px}.mw-storage-stats>div{padding:10px}.mw-storage-stats strong{font-size:18px}.mw-storage-row{flex-wrap:wrap}.mw-storage-row>.actions{width:100%;justify-content:flex-end}.mw-storage-confirm .actions{flex-wrap:wrap}}

.mw-detection h3{font-size:16px;margin-bottom:16px}.mw-detection>label.inline{display:flex;gap:8px;align-items:center;font-size:13px}.mw-detection-status{display:flex;gap:12px;align-items:center;margin:15px 0;flex-wrap:wrap}.mw-floating-explanation{background:#f7f4fd;border-radius:10px;padding:14px;margin-top:15px}.mw-floating-explanation b{font-size:12px}.mw-floating-explanation p{font-size:11px;color:var(--mw-muted);margin:8px 0 0}

.mw-assistant-voice{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}.mw-assistant-voice>button:first-child{display:flex;align-items:center;gap:5px;font-size:11px!important;color:var(--mw-purple)!important;border-color:#e8e0f5!important;padding:6px 9px!important}.mw-assistant-voice>span{font-size:10px;color:var(--mw-muted);max-width:220px;overflow-wrap:anywhere}.mw-assistant-voice .mw-voice-active{background:#f5efff!important}.mw-question-bar{flex-wrap:wrap}.mw-assistant-compact .mw-question-hint{display:none}

/* In-place task editing and business-owned popovers stay inside the workbench. */
.meeting-workspace{position:relative}.mw-popover-layer{position:absolute;inset:0;z-index:100;pointer-events:none;overflow:hidden}.mw-cell-popover{position:absolute;pointer-events:auto;background:#fff;border:1px solid #e7e2f0;border-radius:14px;box-shadow:0 12px 40px #40305325;padding:13px;display:flex;flex-direction:column;gap:10px;overflow:auto;box-sizing:border-box;color:var(--mw-text,#303442)}.mw-cell-popover>header{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px}.mw-cell-popover>input{width:100%;min-width:0;font-size:12px}.mw-cell-popover>footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;border-top:1px solid #eeebf4;padding-top:10px;font-size:10px}.mw-cell-popover>footer>.link{margin-right:auto}.mw-cell-popover button{font-size:11px;padding:7px 10px}.mw-cell-popover .link{padding:3px}.mw-people-options{max-height:210px;overflow:auto;min-height:24px}.mw-add-person{text-align:left;overflow-wrap:anywhere;white-space:normal!important;color:#6c53d7!important;background:#f6f3fd!important;border-color:transparent!important}.mw-inline-error{font-size:10px;color:#b74c55;line-height:1.6;white-space:normal!important;margin:6px 0}.mw-editable-tasks .mw-task-title-cell{display:flex;align-items:flex-start;gap:10px}.mw-task-title-cell>input{margin-top:8px;flex-shrink:0}.meeting-workspace .mw-cell-trigger{border:1px solid transparent;background:transparent;text-align:left;color:inherit;box-shadow:none;white-space:normal;line-height:1.8;border-radius:7px;min-height:32px;max-width:100%;font-size:12px;padding:4px 6px}.meeting-workspace .mw-cell-trigger:hover{background:#f8f6fe;border-color:#e6dff6}.mw-title-trigger{flex:1;min-width:0;overflow-wrap:anywhere}.mw-edit-hint{opacity:0;color:#a69abf;margin-left:8px}.mw-title-trigger:hover .mw-edit-hint,.mw-title-trigger:focus-visible .mw-edit-hint{opacity:1}.mw-inline-title{flex:1;min-width:0}.meeting-workspace .mw-inline-title textarea{width:100%;min-height:80px;font-size:12px;line-height:1.8;padding:7px}.mw-inline-title small{display:block;color:#aaa4b5;font-size:9px;white-space:normal}.mw-people-trigger{display:flex;align-items:center;flex-wrap:wrap;gap:4px;min-width:110px}.mw-person-chip{padding:1px 7px;border-radius:6px;background:#f2eefb;color:#75638f;font-size:11px;overflow-wrap:anywhere;max-width:100%}.mw-cell-caret{color:#b0a9bc;font-size:11px;margin-left:auto}.mw-date-cell{display:flex;align-items:center;gap:2px;min-width:135px}.meeting-workspace .mw-date-cell input{font:inherit;color:inherit;min-width:0;width:126px;padding:7px 3px;border:1px solid transparent;background:transparent;border-radius:7px}.meeting-workspace .mw-date-cell input:hover,.meeting-workspace .mw-date-cell input:focus{border-color:#e6dff6;background:#f8f6fe}.meeting-workspace .mw-project-cell{font-size:11px;border-color:transparent;background:#faf9fc;max-width:180px;min-width:95px;padding:7px;color:#75638f}.mw-task-source{text-align:left;white-space:normal!important;line-height:1.8}.meeting-workspace .mw-editable-tasks td:last-child{min-width:55px;width:65px}.meeting-workspace .mw-editable-tasks table{min-width:740px}.meeting-workspace .mw-global-tasks table{min-width:1000px}.meeting-workspace .mw-editable-tasks td:first-child{width:32%;min-width:240px}.meeting-workspace .mw-editable-tasks td:nth-child(2){min-width:135px;max-width:220px}.meeting-workspace .mw-editable-tasks td:nth-child(3){min-width:145px}.mw-dialog .mw-people-picker{margin:0}.mw-dialog .mw-people-trigger{width:100%;background:#faf9fc;border-color:#e7e2f0}

/* Meeting assistant: our own message list and composer, using DSH session services. */
.mw-business-chat{min-height:0;flex:1;overflow:hidden;background:#faf9fd}.mw-business-chat>.mw-assistant-heading{padding:20px 24px;background:#fff;flex-wrap:wrap;gap:12px;flex-shrink:0}.mw-business-chat .mw-assistant-heading>div:first-child{display:flex;align-items:center;gap:12px;min-width:0;flex-wrap:wrap}.mw-business-chat .mw-assistant-heading h1{margin:0;font-size:22px}.meeting-workspace .mw-scope-trigger{display:flex;align-items:center;gap:8px;border:0;color:#8d7eaa;background:#f3eefb;border-radius:20px;padding:7px 11px;font-size:11px;max-width:300px;min-width:0}.mw-scope-trigger>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mw-range-options{min-height:0;overflow:auto;max-height:290px}.mw-range-options>h3{font-size:10px;color:#aaa1b6;margin:13px 6px 5px}.mw-range-options>button{display:flex;gap:10px;align-items:center;justify-content:space-between;width:100%;white-space:normal!important;text-align:left;border:0!important;box-shadow:none!important;background:transparent!important;border-radius:8px;font-size:12px!important;line-height:1.7}.mw-range-options>button:hover,.mw-range-options>button.active{background:#f2edfc!important;color:#6c53d7}.mw-range-options>button>span{min-width:0;overflow-wrap:anywhere}.mw-range-options small{display:block;color:#aaa2b6;font-size:10px;flex-shrink:0;white-space:normal}.mw-business-chat-body{flex:1;min-height:0;display:flex;overflow:hidden}.mw-business-chat-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.mw-chat-messages{flex:1;min-height:0;overflow:auto;padding:22px 26px;overscroll-behavior:contain}.mw-chat-message{display:flex;gap:12px;margin:0 0 24px;max-width:100%;font-size:13px;line-height:1.8}.mw-chat-message>div:last-child{min-width:0;max-width:calc(100% - 44px);flex:1}.mw-chat-avatar{width:30px;height:30px;border-radius:10px;background:#ebe4fc;color:#7357cc;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px}.mw-chat-message.is-user .mw-chat-avatar{background:#eeedf1;color:#91909b}.mw-chat-role{display:block;font-size:11px;color:#8b8398;margin:4px 0 8px}.mw-chat-message.is-user .mw-chat-markdown{background:#f0ebfa;padding:10px 14px;border-radius:0 14px 14px 14px;display:inline-block}.mw-chat-markdown{overflow-wrap:anywhere;white-space:pre-wrap}.mw-chat-markdown p{margin:0 0 6px;line-height:1.8}.mw-chat-markdown h3{font-size:14px;margin:16px 0 8px}.mw-chat-markdown code{font-size:12px;background:#ede8f5;border-radius:4px;padding:2px 4px}.mw-business-chat-welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-height:190px;text-align:center;padding:20px 0}.mw-business-chat-welcome h2{font-size:19px;margin:0}.mw-business-chat-welcome .mw-assistant-mark{margin:0;width:42px;height:42px;border-radius:14px}.mw-chat-thinking{font-size:11px;color:#9c90b4;display:flex;align-items:center;gap:8px}.mw-chat-thinking>span{width:6px;height:6px;border-radius:50%;background:#a08acd;animation:mw-chat-pulse 1.5s ease-in-out infinite}@keyframes mw-chat-pulse{50%{opacity:.25}}.mw-chat-error{font-size:11px;padding:8px 20px;color:#aa5966;display:flex;justify-content:space-between;gap:10px}.mw-business-composer{flex-shrink:0;margin:0 20px 18px;border:1px solid #e3dbf0;background:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 4px 18px #6c53d709;min-width:0}.meeting-workspace .mw-business-composer textarea{border:0;outline:0;box-shadow:none;resize:vertical;min-height:54px;max-height:150px;width:100%;padding:2px;font-size:12px;line-height:1.7;background:transparent}.mw-composer-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}.mw-composer-toolbar>.link{display:flex;align-items:center;gap:4px;font-size:10px}.mw-composer-toolbar .mw-assistant-voice{display:flex;align-items:center;gap:5px;min-width:0;max-width:100%;flex-wrap:wrap}.mw-composer-toolbar .mw-assistant-voice button{font-size:10px;padding:6px 7px}.mw-composer-toolbar .mw-assistant-voice>span{font-size:9px;max-width:180px}.mw-composer-model{font-size:10px;color:#aaa1b7;margin-left:auto}.mw-business-composer .mw-chat-send{font-size:11px;padding:7px 12px;border-radius:10px}.mw-business-sources{width:220px;max-width:30%;padding:14px;border-left:1px solid #eee8f4;overflow:auto;flex-shrink:0}.mw-business-sources>.mw-source-hit{margin-top:10px;display:block;max-width:100%;white-space:normal}.mw-business-sources>.link{font-size:10px}.mw-business-chat.mw-assistant-compact>.mw-assistant-heading{padding:12px 14px}.mw-business-chat.mw-assistant-compact .mw-assistant-heading h1{display:none}.mw-assistant-compact .mw-chat-messages{padding:14px}.mw-assistant-compact .mw-business-composer{margin:0 12px 12px;padding:10px}.mw-assistant-compact .mw-business-sources{display:none}.mw-assistant-compact .mw-business-chat-welcome{min-height:150px}.mw-assistant-compact .mw-business-chat-welcome h2{font-size:16px}.mw-assistant-compact .mw-composer-model{display:none}.mw-assistant-compact .mw-composer-toolbar .mw-assistant-voice>span{display:none}
@container(max-width:800px){.mw-business-sources{max-width:none;width:auto;max-height:150px;border-left:0;border-top:1px solid #eee8f4;flex-shrink:1}.mw-business-chat-body{flex-direction:column}.mw-business-sources .mw-source-hit{padding:8px}.mw-business-chat>.mw-assistant-heading{padding:16px}.mw-chat-messages{padding:16px}.mw-business-composer{margin:0 12px 12px}.mw-business-chat .mw-assistant-heading h1{font-size:19px}.meeting-workspace .mw-scope-trigger{max-width:230px}}
@container(max-width:500px){.mw-business-chat .mw-assistant-heading .actions{justify-content:flex-start}.mw-business-chat .mw-assistant-heading button{font-size:10px;padding:6px 9px}.mw-composer-toolbar{gap:5px}.mw-composer-model{display:none}.mw-chat-message{font-size:12px;gap:8px}.mw-chat-message>div:last-child{max-width:calc(100% - 38px)}}

.mw-plan-manager .mw-plan-delete{margin-right:auto}.mw-plan-undo{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.mw-plan-undo>span{margin-right:auto}.mw-plan-undo button{font-size:11px;padding:5px 9px}
@container(max-width:650px){.mw-overview-plan>div>.mw-plan-quick-actions{gap:6px}.mw-plan-manager footer{gap:8px}.mw-plan-manager .mw-plan-delete{margin-right:0}}

/* Task rows reflow according to the space available inside the detail or global panel. */
.meeting-workspace .mw-editable-tasks { container: mw-tasks / inline-size; overflow: visible; }
.meeting-workspace .mw-editable-tasks table { width: 100%; min-width: 0; table-layout: fixed; }
.meeting-workspace .mw-editable-tasks td { min-width: 0; white-space: normal; vertical-align: top; }
.mw-editable-tasks th:nth-child(1) { width: auto; }
.mw-editable-tasks th:nth-child(2) { width: 118px; }
.mw-editable-tasks th:nth-child(3) { width: 164px; }
.mw-editable-tasks th:nth-last-child(2) { width: 106px; }
.mw-editable-tasks th:last-child { width: 65px; }
.mw-global-tasks th:nth-child(4) { width: 130px; }
.meeting-workspace .mw-editable-tasks .mw-title-trigger {
  flex: 1 1 0; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere;
}
.meeting-workspace .mw-editable-tasks .mw-people-trigger { flex-wrap: wrap; white-space: normal; }
.mw-editable-tasks .mw-person-chip { max-width: 100%; overflow-wrap: anywhere; white-space: normal; }
.mw-editable-tasks .mw-date-cell { flex-wrap: wrap; }
.mw-editable-tasks .mw-date-cell input { width: 123px; }
.mw-editable-tasks .mw-project-cell, .mw-editable-tasks .mw-task-source { max-width: 100%; overflow-wrap: anywhere; }
@container mw-tasks (max-width: 790px) {
  .mw-editable-tasks table, .mw-editable-tasks tbody { display: block; }
  .mw-editable-tasks thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .mw-editable-tasks tbody tr {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
    border-bottom: 1px solid var(--mw-line); padding: 8px 0;
  }
  .meeting-workspace .mw-editable-tasks tbody td { display: block; padding: 5px 8px; border: 0; }
  .mw-editable-tasks tbody td:first-child { grid-column: 1 / -1; }
  .mw-editable-tasks tbody td:not(:first-child)::before {
    content: attr(data-label); display: block; color: var(--mw-muted); font-size: 11px; margin-bottom: 3px;
  }
}

.mw-summary-reader { margin: 12px 0 24px; padding: 16px; border: 1px solid var(--mw-line); border-radius: 12px; min-width: 0; }
.mw-summary-text { line-height: 1.75; overflow-wrap: anywhere; }
.mw-summary-text h3 { color: #443678; border-bottom: 1px solid #efebf8; padding-bottom: 6px; margin: 17px 0 8px; }
.mw-summary-text p { margin: 0 0 8px; }
.mw-summary-text ul, .mw-summary-text ol { margin: 6px 0 14px; padding-inline-start: 22px; }
.mw-summary-text li + li { margin-top: 5px; }
.mw-summary-table { max-width: 100%; overflow-x: auto; }
.mw-summary-table table { width: 100%; border-collapse: collapse; }
.mw-summary-table :is(th,td) { border: 1px solid var(--mw-line); padding: 7px; text-align: left; }
.mw-summary-table th { background: #f6f2ff; }
.mw-summary-diagram { margin-top: 16px; border-top: 1px solid var(--mw-line); padding-top: 12px; }
.mw-summary-diagram > summary { color: #5f45bc; font-weight: 600; cursor: pointer; overflow-wrap: anywhere; }
.mw-diagram-steps { display: grid; gap: 10px; padding: 0; list-style: none; }
.mw-diagram-steps.topics { grid-template-columns: repeat(auto-fit, minmax(min(100%, 205px), 1fr)); }
.mw-diagram-steps li { display: flex; gap: 9px; background: #f8f5ff; padding: 12px; border-radius: 9px; overflow-wrap: anywhere; }
.mw-diagram-steps li > div { min-width: 0; }
.mw-diagram-steps li p { margin: 4px 0; }
.mw-diagram-number { flex: none; width: 23px; height: 23px; display: grid; place-items: center; color: #5b42b4; background: #ebe3ff; border-radius: 50%; }
.mw-diagram-steps.ordered li + li { position: relative; margin-top: 8px; }
.mw-diagram-steps.ordered li + li::before { content: '\u2193'; position: absolute; top: -18px; left: 17px; color: #7758ca; }

.mw-minutes-formats { display: grid; gap: 8px; }
.meeting-workspace .mw-minutes-formats button { text-align: left; width: 100%; }

/* The workbench contains both panes. Each measures its own available width. */
.mw-business-pane { display:flex; flex:1; min-width:0; min-height:0; container-type:inline-size; }
.mw-business-pane > .mw-content { min-height:0; }
.mw-assistant-dock { display:flex; flex-direction:column; flex:0 0 clamp(330px, 39%, 520px); min-width:0; min-height:0; overflow:hidden; border-left:1px solid var(--mw-line); container-type:inline-size; }
.mw-assistant-dock[hidden], .mw-assistant-dock-thread[hidden] { display:none; }
.mw-assistant-dock-title, .mw-assistant-dock-controls { display:flex; align-items:center; gap:8px; padding:10px 14px; border-bottom:1px solid var(--mw-line); background:#fff; }
.mw-assistant-dock-title { justify-content:space-between; }
.mw-assistant-dock-controls { flex-wrap:wrap; }
.mw-assistant-dock-controls .mw-assistant-scope { max-width:100%; }
.mw-assistant-dock-title > button { font-size:16px; line-height:1; }
.mw-assistant-dock-thread { flex:1; display:flex; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.mw-assistant-dock-empty { flex:1; padding:22px 18px; color:#66647a; overflow:auto; }
.mw-assistant-dock-footer { padding:5px 14px 8px; border-top:1px solid var(--mw-line); background:#fff; }
.mw-assistant-dock-sources { margin-top:4px; max-height:95px; overflow:auto; }
.mw-assistant-dock-sources summary { cursor:pointer; color:#6f6397; }
.mw-assistant-dock-sources ul { margin:4px 0; padding:0 16px; }
.meeting-workspace .mw-assistant-active { border-color:#d8cbee; background:#f0ebfc; color:var(--mw-purple); }

@container (max-width:760px) {
 .mw-docked-frame.is-assistant-open { flex-direction:column; }
 .mw-docked-frame.is-assistant-open .mw-business-pane { flex:1 1 44%; }
 .mw-assistant-dock { flex:1 1 56%; border-left:0; border-top:1px solid var(--mw-line); }
}

.mw-import-modes{margin-bottom:18px}
.meeting-workspace .mw-import-modes button.active{color:var(--mw-purple);background:#f0ebff;border-color:#ddd4fa}
.mw-minutes-actions{margin:-3px 0 15px;align-items:center;flex-wrap:wrap}
.mw-minutes-actions a{color:var(--mw-purple);overflow-wrap:anywhere}
.mw-minutes-preview{max-height:220px;overflow:auto;border:1px solid var(--mw-line);border-radius:9px;padding:12px;margin:8px 0;overflow-wrap:anywhere}
.mw-minutes-preview h3{margin:0 0 8px}
.mw-minutes-preview small{font-weight:normal;color:var(--mw-muted);margin-left:7px}
.mw-minutes-preview article{border-top:1px solid var(--mw-line);padding:9px 0}
.mw-minutes-preview strong{font-size:12px;color:var(--mw-purple)}
.mw-minutes-preview p{margin:5px 0 0;white-space:pre-wrap}

.mw-detail.mw-detail-transcript{grid-template-columns:minmax(0,1fr)}
.mw-full-transcript{min-width:0;padding-bottom:24px}
.mw-transcript-heading,.mw-transcript-heading>div{display:flex;align-items:center;gap:9px}
.mw-transcript-heading{justify-content:space-between;flex-wrap:wrap;margin:0 0 12px}
.mw-transcript-heading h2{margin:0;font-size:16px}
.mw-transcript-heading span,.mw-transcript-search span{color:#747988;font-size:11px;white-space:nowrap}
.meeting-workspace button.mw-transcript-icon{width:34px;height:34px;padding:0;display:grid;place-items:center;border-color:transparent;background:transparent}
.meeting-workspace button.mw-transcript-icon:hover,.meeting-workspace button.mw-transcript-icon[aria-expanded=true]{background:#f0ebfb;color:var(--mw-purple)}
.mw-transcript-search{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.mw-transcript-search input{flex:1;min-width:0}
.mw-transcript-timeline article{display:grid;grid-template-columns:32px minmax(0,1fr);gap:10px;align-items:start;padding:10px 3px;border-radius:8px}
.mw-transcript-timeline article.highlight{background:#f0ebfb}
.mw-transcript-avatar{width:29px;height:29px;display:grid;place-items:center;align-self:start;border-radius:50%;font-size:12px;font-weight:600;background:#ebedf3;color:#5b6373}
.mw-transcript-avatar[data-tone="1"]{background:#e7ebff;color:#3c51bb}
.mw-transcript-avatar[data-tone="2"]{background:#dff5fc;color:#126d88}
.mw-transcript-avatar[data-tone="3"]{background:#efe8ff;color:#6844b6}
.mw-transcript-avatar[data-tone="4"]{background:#e3f4ed;color:#246f57}
.mw-transcript-avatar[data-tone="5"]{background:#faecd9;color:#925316}
.mw-transcript-avatar[data-tone="6"]{background:#fbe5ec;color:#9c355a}
.mw-transcript-timeline article header{display:flex;flex-wrap:wrap;gap:3px 8px;align-items:baseline;color:#626978;font-size:11px;line-height:1.6}
.mw-transcript-timeline article header strong{font-weight:600;overflow-wrap:anywhere}
.mw-transcript-timeline article header span{font-variant-numeric:tabular-nums}
.mw-transcript-timeline article p{color:#252a35;font-size:13px;line-height:1.85;margin:3px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}
.mw-transcript-timeline mark{color:inherit;background:#e6dcfa;border-radius:3px}
.mw-source .mw-transcript-timeline{padding:0 14px 12px;overflow:auto;max-height:620px}
.mw-source .mw-transcript-timeline article{grid-template-columns:26px minmax(0,1fr);gap:7px}
.mw-source .mw-transcript-avatar{width:24px;height:24px}
.mw-source-citation{margin:10px 14px;background:#f8f5fd;border-radius:8px;padding:9px}
.mw-source-citation>p{margin:0 3px 4px}
.mw-source-citation .mw-transcript-timeline{padding:0}

/* The business pane can narrow independently when the assistant is docked. */
.mw-business-pane { container-name: mw-business; }
.mw-content { scrollbar-gutter: stable; }
.mw-home-content { width:100%; }
.mw-nav { padding-block:8px 0; column-gap:20px; background:var(--mw-surface); }
.mw-nav [role=tablist] { gap:3px; min-width:0; flex-wrap:wrap; }
.meeting-workspace .mw-nav [role=tab] {
  border:0; border-bottom:2px solid transparent; border-radius:5px 5px 0 0; padding:12px 10px;
  background:transparent; color:var(--mw-muted); font-weight:500;
}
.meeting-workspace .mw-nav [role=tab]:hover { background:#f5f2fc; }
.meeting-workspace .mw-nav [role=tab].active { color:var(--mw-purple); border-bottom-color:var(--mw-purple); font-weight:650; }
.mw-tools { min-width:0; gap:7px; margin-bottom:6px; flex:0 1 360px; flex-wrap:nowrap; }
.mw-global-search { display:flex; align-items:center; min-width:0; position:relative; flex:1 1 175px; }
.mw-global-search svg { position:absolute; left:9px; color:var(--mw-muted); pointer-events:none; }
.meeting-workspace .mw-global-search input {
  width:100%; max-width:none; padding:7px 9px 7px 30px; min-height:32px; background:#f8f9fc; font-size:12px;
}
.meeting-workspace .mw-tools>button { padding:6px 9px; min-height:32px; }
.meeting-workspace button.mw-action-icon { display:inline-flex; align-items:center; gap:6px; min-height:36px; }
.mw-home-heading { margin-top:0; margin-bottom:18px; }
.mw-home-heading>div>p { font-size:12px; margin:0; }
.mw-home-counts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); margin:0 0 22px; background:var(--mw-surface); border:1px solid var(--mw-line); border-radius:9px; }
.meeting-workspace .mw-home-counts>button {
  display:flex; gap:8px 10px; flex-wrap:wrap; align-items:baseline; min-width:0; padding:11px 15px;
  border:0; border-radius:0; text-align:left; color:var(--mw-muted); white-space:normal;
}
.meeting-workspace .mw-home-counts>button + button { border-left:1px solid var(--mw-line); }
.meeting-workspace .mw-home-counts>button:first-child { border-radius:9px 0 0 9px; }
.meeting-workspace .mw-home-counts>button:last-child { border-radius:0 9px 9px 0; }
.mw-home-counts strong { color:#202331; font-size:21px; line-height:1.2; font-variant-numeric:tabular-nums; }
.mw-home-counts span { font-size:12px; overflow-wrap:anywhere; }
.mw-home-grid { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(275px,1fr); gap:16px; align-items:start; }
.mw-home-recent>.mw-card-head { padding:15px 18px; border-bottom:1px solid var(--mw-line); }
.mw-home-recent>.mw-card-head>.link { font-size:12px; }
.mw-dashboard { display:grid; grid-template-columns:minmax(0,1fr); gap:14px; min-width:0; }
.mw-overview-card { display:flex; flex-direction:column; height:235px; }
.mw-overview-card>header,.mw-overview-card>footer { flex-shrink:0; padding:11px 14px; }
.mw-overview-card>header { display:flex; justify-content:space-between; align-items:center; gap:6px; border-bottom:1px solid var(--mw-line); }
.mw-overview-card>header small { margin-left:5px; font-size:11px; font-weight:500; font-variant-numeric:tabular-nums; }
.mw-overview-card>header .link { font-size:11px; }
.mw-overview-card>footer { border-top:1px solid var(--mw-line); }
.meeting-workspace .mw-overview-card>footer button { border:0; padding:2px 4px; color:var(--mw-purple); font-size:11px; }
.mw-overview-list { flex:1; min-height:0; min-width:0; overflow:auto; overscroll-behavior:contain; padding:0 14px; }
.mw-overview-list article { min-width:0; padding:11px 0; border-bottom:1px solid var(--mw-line); }
.mw-overview-list article:last-child { border:0; }
.mw-overview-list strong { font-size:12px; line-height:1.55; overflow-wrap:anywhere; }
.mw-overview-plan { display:grid; grid-template-columns:64px minmax(0,1fr); gap:10px; align-items:start; }
.mw-agenda-time { display:flex; flex-direction:column; gap:3px; padding:6px 4px; text-align:center; background:#f2eefb; color:var(--mw-purple); border-radius:7px; }
.mw-agenda-time strong { font-size:14px; font-variant-numeric:tabular-nums; }
.mw-agenda-time span { font-size:10px; }
.mw-agenda-entry-actions { display:flex; flex-wrap:wrap; align-items:center; gap:3px 6px; margin-top:5px; }
.meeting-workspace .mw-agenda-entry-actions>.link { font-size:11px; padding:2px 3px; }
.mw-overview-task label { display:flex; align-items:flex-start; gap:7px; }
.mw-overview-task input { margin:2px 0 0; }
.mw-overview-task>div { display:flex; flex-wrap:wrap; align-items:center; gap:3px 8px; font-size:11px; color:var(--mw-muted); margin:4px 0 0 22px; }
.meeting-workspace .mw-overview-task .link { font-size:11px; padding:0; max-width:100%; overflow-wrap:anywhere; }
.mw-overview-task .overdue { color:#97542e; }
.mw-overview-empty { color:var(--mw-muted); font-size:12px; padding:27px 3px; }

.meeting-workspace .mw-meeting-row .mw-meeting { display:grid!important; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:12px; padding:13px 16px!important; border-top:0!important; }
.mw-meeting-row .mw-file-icon { display:grid; place-items:center; padding:8px; background:#f2eefb; color:var(--mw-purple); border-radius:7px; }
.mw-meeting-row .mw-meeting h3 { display:block; font-size:13px; line-height:1.55; margin:0 0 4px; }
.mw-meeting-meta,.mw-detail-meta { display:flex; gap:3px 9px; flex-wrap:wrap; align-items:center; color:var(--mw-muted); font-size:11px; line-height:1.6; }
.mw-meeting-meta>*,.mw-detail-meta>* { min-width:0; overflow-wrap:anywhere; }
.mw-meeting-meta>* + *::before,.mw-detail-meta>* + *:not(.badge)::before { content:''; display:inline-block; width:3px; height:3px; border-radius:50%; background:#b5b9c4; margin:0 8px 2px 0; }
.mw-meeting-meta .mw-participants { max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mw-meeting-row .mw-meeting p { color:#515668; margin:4px 0 0; font-size:12px; line-height:1.6; }
.mw-meeting-end { display:flex; align-items:center; gap:6px; color:#747b8d; }
.meeting-workspace .badge:not(.mw-host-conversation *) { color:#5e5870; background:#f1eff6; font-size:10px; }
.meeting-workspace .badge.mw-state-pending { color:#83551b; background:#fcf0dd; }

.mw-project-collections { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:17px; min-width:0; }
.meeting-workspace button.mw-project-folder {
  display:inline-flex; align-items:center; gap:7px; padding:7px 9px; min-width:0; max-width:100%;
  border-radius:7px; white-space:normal; text-align:left; color:#383d4d;
}
.mw-project-folder>svg { width:16px; height:16px; flex-shrink:0; color:var(--mw-purple); }
.mw-project-folder>span:not(.mw-folder-plus) { display:flex; align-items:center; gap:7px; min-width:0; }
.mw-project-folder strong { font-size:12px; line-height:1.45; overflow-wrap:anywhere; }
.mw-project-folder small { flex-shrink:0; font-size:11px; font-variant-numeric:tabular-nums; }
.meeting-workspace button.mw-project-folder.is-active { background:#eee9fb; border-color:#d8cdf6; color:var(--mw-purple); }
.meeting-workspace button.mw-project-folder-new { border-style:dashed; color:var(--mw-purple); background:transparent; }
.mw-folder-plus { line-height:1; font-size:17px; }
.mw-records-list>.mw-bulk-toolbar { min-height:44px; padding-block:8px; margin-bottom:12px; }
.mw-project-meetings>.mw-card-head { padding:13px 17px; }
.mw-project-meetings>.mw-card-head svg { width:18px; height:18px; }

.mw-detail-heading h1 { max-inline-size:33em; text-wrap:balance; }
.mw-detail-meta { font-size:12px; }
.mw-detail-meta .badge { margin-left:4px; }
.mw-tabs { padding:0 14px; gap:7px; }
.meeting-workspace .mw-tabs>button { display:flex; align-items:baseline; gap:5px; border:0; border-bottom:2px solid transparent; border-radius:0; padding:11px 8px; background:transparent; }
.meeting-workspace .mw-tabs>button.active { color:var(--mw-purple); border-bottom-color:var(--mw-purple); font-weight:650; }
.mw-tabs>button>small { font-size:10px; }
.mw-full-transcript { max-inline-size:78ch; margin-inline:auto; }
.mw-full-transcript .mw-transcript-timeline article { padding:11px 3px; gap:12px; }
.mw-full-transcript .mw-transcript-timeline article p { font-size:14px; line-height:1.85; }
.mw-full-transcript .mw-transcript-timeline article header { font-size:12px; }

@container (max-width:650px) {
 .mw-nav { padding:5px 12px 0; gap:4px 12px; }
 .mw-nav [role=tablist] { width:100%; }
 .meeting-workspace .mw-nav [role=tab] { padding:8px 7px; }
 .mw-tools { width:100%; flex:1 0 100%; }
}
@container mw-business (width > 700px) {
 .mw-home-grid { align-items:stretch; }
 .mw-dashboard { grid-template-rows:repeat(2,minmax(235px,1fr)); }
 /* The lists scroll inside their cards, so their length must not size the grid. */
 .mw-overview-card { height:auto; contain:size; }
}
@container mw-business (max-width:700px) {
 .mw-home-grid { grid-template-columns:minmax(0,1fr); }
}
@container mw-business (max-width:500px) {
 .mw-home-heading { gap:10px; }
 .mw-home-counts>button { align-content:flex-start; }
 .mw-home-counts span { font-size:11px; }
 .meeting-workspace .mw-home-counts>button { padding:8px 10px; gap:3px 7px; }
 .mw-home-counts strong { font-size:19px; }
 .meeting-workspace .mw-meeting-row .mw-meeting { grid-template-columns:minmax(0,1fr) auto; gap:7px; padding:12px 10px!important; }
 .mw-meeting-row .mw-file-icon { display:none; }
 .mw-meeting-end { align-self:start; }
 .mw-meeting-end>svg { display:none; }
 .mw-full-transcript .mw-transcript-timeline article { gap:8px; }
}

.mw-task-filters { display:flex; align-items:center; gap:9px; margin-bottom:16px; }
.mw-task-filter-controls { display:grid; flex:1; min-width:0; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; }
.meeting-workspace button.mw-task-filter {
 position:relative; display:grid; justify-items:start; gap:3px; min-width:0; min-height:47px; padding:6px 24px 6px 10px;
 border:1px solid var(--mw-line); border-radius:8px; background:var(--mw-surface); color:inherit; text-align:left;
}
.mw-task-filter-label { font-size:10px; line-height:1.15; color:var(--mw-muted); }
.mw-task-filter-value { max-width:100%; min-width:0; overflow:hidden; text-overflow:ellipsis; font-size:12px; font-weight:550; }
.mw-task-filter>svg { position:absolute; bottom:9px; right:8px; color:var(--mw-muted); pointer-events:none; }
.meeting-workspace button.mw-task-filter:hover,.meeting-workspace button.mw-task-filter[aria-expanded=true] { border-color:#bfb0e8; }
.meeting-workspace button.mw-task-filter.is-active { background:#f4effd; border-color:#ddd2f6; color:var(--mw-purple); }
.mw-task-filter[aria-expanded=true]>svg { transform:rotate(180deg); }
.mw-task-filter-menu { padding:5px; gap:0; border-radius:10px; }
.mw-task-filter-options { min-width:0; }
.mw-task-filter-options:focus-visible { outline:none!important; }
.meeting-workspace .mw-task-filter-options>button {
 display:flex; justify-content:space-between; align-items:center; gap:8px; width:100%; min-height:34px;
 padding:6px 8px; border:0; border-radius:6px; color:#34384a; text-align:left; white-space:normal; overflow-wrap:anywhere;
}
.meeting-workspace .mw-task-filter-options>button[aria-selected=true] { background:#f1ebfc; color:var(--mw-purple); font-weight:600; }
.meeting-workspace .mw-task-filter-options>button.is-focused,.meeting-workspace .mw-task-filter-options>button:hover {
 box-shadow:inset 0 0 0 1px #ddcff7; background:#f6f1ff;
}
.mw-task-filter-options svg { flex-shrink:0; }
.meeting-workspace .mw-task-filter-reset { padding:5px 2px; font-size:11px; }
@container mw-business (max-width:620px) {
 .mw-task-filters { flex-wrap:wrap; }
 .mw-task-filter-controls { flex-basis:100%; grid-template-columns:repeat(3,minmax(0,1fr)); }
}
@container mw-business (max-width:400px) {
 .mw-task-filter-controls { grid-template-columns:repeat(2,minmax(0,1fr)); }
}

.mw-people-popover { gap:8px; border-radius:12px; padding:11px; }
.mw-people-popover>header,.mw-people-popover>footer,.mw-people-popover>.mw-people-search { flex-shrink:0; }
.mw-people-popover>header { gap:8px; }
.meeting-workspace .mw-people-manage { margin-left:auto; font-size:11px; }
.mw-people-selected { display:flex; align-items:center; flex-wrap:wrap; gap:5px; max-height:72px; overflow:auto; font-size:11px; }
.meeting-workspace .mw-people-chip-remove {
 display:flex; align-items:center; gap:6px; max-width:100%; padding:2px 7px; border-color:transparent; border-radius:6px;
 background:#f1ebfb; color:var(--mw-purple); white-space:normal; text-align:left; overflow-wrap:anywhere;
}
.meeting-workspace .mw-people-chip-remove:hover { border-color:#dbcef7; background:#ebe2fb; }
.mw-people-search { position:relative; display:flex; align-items:center; }
.mw-people-search>svg { position:absolute; left:8px; color:var(--mw-muted); pointer-events:none; }
.meeting-workspace .mw-people-search>input { width:100%; font-size:12px; padding:7px 8px 7px 28px; }
.mw-people-options { flex:1 1 auto; min-height:25px; max-height:180px; overflow:auto; }
.mw-people-options>p,.mw-people-popover>.mw-people-help { margin:2px 0; color:var(--mw-muted); font-size:11px; line-height:1.5; }
.meeting-workspace .mw-people-option,.mw-people-roster-row {
 display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%;
 padding:5px 7px; border:0; background:transparent; border-radius:6px; text-align:left; white-space:normal; overflow-wrap:anywhere;
}
.mw-people-option>span:last-child { color:var(--mw-purple); flex-shrink:0; }
.mw-people-roster-row { min-height:30px; font-size:12px; }
.mw-people-archived { margin:7px 0 2px; padding:4px 7px; color:var(--mw-muted); border-top:1px solid var(--mw-line); font-size:11px; }
.mw-people-popover>footer { gap:5px; padding-top:7px; }
`;

// src/assistant-context.mjs
function scopeKey(scope = { kind: "all" }) {
  return scope.kind === "meeting" ? "meeting:" + scope.id : scope.kind === "project" ? "project:" + scope.id : "all";
}
function scopeFromBinding(binding) {
  return binding?.meetingId ? { kind: "meeting", id: binding.meetingId } : binding?.project ? { kind: "project", id: binding.project } : { kind: "all" };
}
function scopeBinding(scope) {
  return { meetingId: scope.kind === "meeting" ? scope.id : null, project: scope.kind === "project" ? scope.id : null };
}
function selectedMeetings(data, scope = { kind: "all" }) {
  if (scope.kind === "meeting") {
    const meeting = data.meetings.find((m) => m.id === scope.id);
    if (!meeting) throw Error("\u6240\u9009\u4F1A\u8BAE\u5DF2\u5220\u9664\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u8303\u56F4");
    return { scope: { ...scope, label: meeting.title, count: 1 }, data: { ...data, meetings: [meeting] } };
  }
  if (scope.kind === "project") {
    const project = data.projects.find((p) => p.id === scope.id);
    if (!project) throw Error("\u6240\u9009\u9879\u76EE\u5DF2\u5220\u9664\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u8303\u56F4");
    const meetings = data.meetings.filter((m) => m.project === scope.id);
    return { scope: { ...scope, label: project.name, count: meetings.length }, data: { ...data, meetings } };
  }
  if (scope.kind !== "all") throw Error("\u4F1A\u8BAE\u8303\u56F4\u65E0\u6548");
  return { scope: { kind: "all", label: "\u5168\u90E8\u4F1A\u8BAE", count: data.meetings.length }, data };
}

// src/client/task-filters.jsx
var import_react6 = __toESM(require("react"), 1);

// src/client/anchored-popover.jsx
var import_react5 = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");
function AnchoredPopover({ anchor, label, onClose, children, width = 290, preferredHeight = 200, className = "", role = "dialog" }) {
  const box = (0, import_react5.useRef)(null), [position, setPosition] = (0, import_react5.useState)(null);
  const close = (0, import_react5.useRef)(onClose);
  close.current = onClose;
  const layer = anchor.current?.closest(".meeting-workspace")?.querySelector(".mw-popover-layer");
  (0, import_react5.useLayoutEffect)(() => {
    if (!layer) return;
    const root = layer.parentElement;
    const place = () => {
      const a = anchor.current?.getBoundingClientRect(), r = root.getBoundingClientRect();
      if (!a) return;
      const gap = 6, margin = 12;
      const panelWidth = Math.min(width, Math.max(0, r.width - margin * 2));
      const belowRoom = r.bottom - a.bottom - gap - margin, aboveRoom = a.top - r.top - gap - margin;
      const below = belowRoom >= preferredHeight || belowRoom >= aboveRoom;
      setPosition({
        left: Math.max(margin, Math.min(a.left - r.left, r.width - panelWidth - margin)),
        ...below ? { top: a.bottom - r.top + gap } : { bottom: r.bottom - a.top + gap },
        width: panelWidth,
        maxHeight: Math.max(0, Math.min(390, below ? belowRoom : aboveRoom))
      });
    };
    const outside = (event) => {
      if (!box.current?.contains(event.target) && !anchor.current?.contains(event.target)) close.current();
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current();
        anchor.current?.focus();
      }
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(root);
    window.addEventListener("resize", place);
    document.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      document.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [layer, width, preferredHeight, anchor]);
  return layer && (0, import_react_dom.createPortal)(
    /* @__PURE__ */ import_react5.default.createElement(
      "div",
      {
        ref: box,
        className: ("mw-cell-popover " + className).trim(),
        role,
        "aria-label": label,
        "data-dsh-no-drag": true,
        style: position || { visibility: "hidden", width }
      },
      children
    ),
    layer
  );
}

// src/client/task-filters.jsx
function TaskFilter({ label, ariaLabel, value, onChange, options, active }) {
  const [open, setOpen] = (0, import_react6.useState)(false), [index, setIndex] = (0, import_react6.useState)(0);
  const anchor = (0, import_react6.useRef)(null), list = (0, import_react6.useRef)(null), id = (0, import_react6.useId)();
  const selectedIndex = Math.max(0, options.findIndex(([key]) => key === value));
  const currentIndex = Math.min(index, options.length - 1);
  const title = options[selectedIndex][1];
  (0, import_react6.useEffect)(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => list.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [open]);
  (0, import_react6.useEffect)(() => {
    if (open) list.current?.children[currentIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, currentIndex]);
  function show() {
    setIndex(selectedIndex);
    setOpen(true);
  }
  function choose(key) {
    onChange(key);
    setOpen(false);
    anchor.current?.focus();
  }
  function move(event) {
    if (event.key === "Tab") {
      setOpen(false);
      anchor.current?.focus();
      return;
    }
    if (event.key === "ArrowDown") setIndex(Math.min(currentIndex + 1, options.length - 1));
    else if (event.key === "ArrowUp") setIndex(Math.max(currentIndex - 1, 0));
    else if (event.key === "Home") setIndex(0);
    else if (event.key === "End") setIndex(options.length - 1);
    else if (event.key === "Enter" || event.key === " ") choose(options[currentIndex][0]);
    else return;
    event.preventDefault();
  }
  return /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement(
    "button",
    {
      ref: anchor,
      type: "button",
      className: "mw-task-filter" + (active ? " is-active" : ""),
      "aria-label": ariaLabel + "\uFF1A" + title,
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      "aria-controls": open ? id : void 0,
      title,
      onClick: () => open ? setOpen(false) : show(),
      onKeyDown: (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          show();
        }
      }
    },
    /* @__PURE__ */ import_react6.default.createElement("span", { className: "mw-task-filter-label" }, label),
    /* @__PURE__ */ import_react6.default.createElement("span", { className: "mw-task-filter-value" }, title),
    /* @__PURE__ */ import_react6.default.createElement("svg", { viewBox: "0 0 12 12", width: "12", height: "12", "aria-hidden": "true" }, /* @__PURE__ */ import_react6.default.createElement("path", { d: "m3 4.5 3 3 3-3", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }))
  ), open && /* @__PURE__ */ import_react6.default.createElement(
    AnchoredPopover,
    {
      anchor,
      onClose: () => setOpen(false),
      role: "presentation",
      width: Math.max(196, anchor.current?.offsetWidth || 0),
      preferredHeight: Math.min(250, options.length * 34 + 12),
      className: "mw-task-filter-menu"
    },
    /* @__PURE__ */ import_react6.default.createElement(
      "div",
      {
        ref: list,
        id,
        className: "mw-task-filter-options",
        role: "listbox",
        "aria-label": ariaLabel,
        "aria-activedescendant": id + "-" + currentIndex,
        tabIndex: 0,
        onKeyDown: move
      },
      options.map(([key, name], position) => /* @__PURE__ */ import_react6.default.createElement(
        "button",
        {
          key,
          id: id + "-" + position,
          type: "button",
          role: "option",
          tabIndex: -1,
          "aria-selected": key === value,
          className: currentIndex === position ? "is-focused" : "",
          onClick: () => choose(key)
        },
        /* @__PURE__ */ import_react6.default.createElement("span", null, name),
        key === value && /* @__PURE__ */ import_react6.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 16 16", "aria-hidden": "true" }, /* @__PURE__ */ import_react6.default.createElement("path", { d: "m3.5 8 3 3 6-6", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }))
      ))
    )
  ));
}
function TaskFilters({ projects, people, filter, project, owner, due, sort, onFilter, onProject, onOwner, onDue, onSort, onReset }) {
  const modified = filter !== "open" || !!project || !!owner || due !== "all" || sort !== "date";
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "mw-task-filters", role: "group", "aria-label": "\u7B5B\u9009\u548C\u6392\u5E8F\u4EFB\u52A1" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "mw-task-filter-controls" }, /* @__PURE__ */ import_react6.default.createElement(
    TaskFilter,
    {
      label: "\u72B6\u6001",
      ariaLabel: "\u4EFB\u52A1\u5B8C\u6210\u72B6\u6001",
      value: filter,
      onChange: onFilter,
      active: filter !== "open",
      options: [["open", "\u5F85\u5B8C\u6210"], ["done", "\u5DF2\u5B8C\u6210"], ["all", "\u5168\u90E8\u4EFB\u52A1"]]
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    TaskFilter,
    {
      label: "\u9879\u76EE",
      ariaLabel: "\u4EFB\u52A1\u9879\u76EE\u7B5B\u9009",
      value: project,
      onChange: onProject,
      active: !!project,
      options: [["", "\u5168\u90E8\u9879\u76EE"], ...projects.map((p) => [p.id, p.name])]
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    TaskFilter,
    {
      label: "\u8D1F\u8D23\u4EBA",
      ariaLabel: "\u8D1F\u8D23\u4EBA\u7B5B\u9009",
      value: owner,
      onChange: onOwner,
      active: !!owner,
      options: [["", "\u5168\u90E8\u8D1F\u8D23\u4EBA"], ...people.map((name) => [name, name])]
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    TaskFilter,
    {
      label: "\u622A\u6B62\u65E5\u671F",
      ariaLabel: "\u622A\u6B62\u65E5\u671F\u7B5B\u9009",
      value: due,
      onChange: onDue,
      active: due !== "all",
      options: [["all", "\u4E0D\u9650\u65E5\u671F"], ["overdue", "\u5DF2\u903E\u671F"], ["week", "\u672A\u6765 7 \u5929"], ["unset", "\u672A\u8BBE\u622A\u6B62\u65E5\u671F"]]
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    TaskFilter,
    {
      label: "\u6392\u5E8F",
      ariaLabel: "\u4EFB\u52A1\u6392\u5E8F",
      value: sort,
      onChange: onSort,
      active: sort !== "date",
      options: [["date", "\u622A\u6B62\u65E5\u671F"], ["title", "\u4EFB\u52A1\u540D\u79F0"]]
    }
  )), modified && /* @__PURE__ */ import_react6.default.createElement("button", { className: "link mw-task-filter-reset", type: "button", onClick: onReset }, "\u91CD\u7F6E\u7B5B\u9009"));
}

// src/client/task-table.jsx
var import_react7 = __toESM(require("react"), 1);
function PeoplePicker({ value, people, archived = [], onRosterChange, onSave, label = "\u8D1F\u8D23\u4EBA", disabled = false }) {
  const [open, setOpen] = (0, import_react7.useState)(false), [chosen, setChosen] = (0, import_react7.useState)([]), [query, setQuery] = (0, import_react7.useState)("");
  const [managing, setManaging] = (0, import_react7.useState)(false), [saving, setSaving] = (0, import_react7.useState)(false), [error, setError] = (0, import_react7.useState)("");
  const anchor = (0, import_react7.useRef)(null), input = (0, import_react7.useRef)(null), pending = (0, import_react7.useRef)(false), original = (0, import_react7.useRef)(value);
  const name = query.trim(), matches = (person) => person.toLowerCase().includes(name.toLowerCase());
  const candidates = (managing ? people : people.filter((person) => !chosen.includes(person))).filter(matches);
  const removed = managing ? archived.filter(matches) : [];
  const canAdd = !managing && validPerson(name) && !people.includes(name) && !chosen.includes(name) && chosen.length < 30;
  (0, import_react7.useEffect)(() => {
    if (open) input.current?.focus();
  }, [open, managing]);
  function close(restoreFocus = false) {
    if (pending.current) return;
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => anchor.current?.focus());
  }
  function toggle() {
    if (open) {
      close();
      return;
    }
    original.current = [...value];
    setChosen([...value]);
    setQuery("");
    setError("");
    setManaging(false);
    setOpen(true);
  }
  function add(person) {
    setChosen((previous) => previous.length >= 30 || previous.includes(person) ? previous : [...previous, person]);
    setQuery("");
    input.current?.focus();
  }
  async function save() {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      await onSave(chosen, original.current);
      setOpen(false);
      requestAnimationFrame(() => anchor.current?.focus());
    } catch (e) {
      setError(e.message);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  async function changeRoster(person, available) {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      await onRosterChange(person, available);
      requestAnimationFrame(() => input.current?.focus());
    } catch (e) {
      setError(e.message);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-people-picker" }, /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      ref: anchor,
      type: "button",
      className: "mw-cell-trigger mw-people-trigger",
      "aria-label": label,
      "aria-expanded": open,
      "aria-haspopup": "dialog",
      disabled,
      onClick: toggle
    },
    value.length ? value.map((person) => /* @__PURE__ */ import_react7.default.createElement("span", { className: "mw-person-chip", key: person }, person)) : /* @__PURE__ */ import_react7.default.createElement("span", { className: "muted" }, "\u672A\u5206\u914D"),
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "mw-cell-caret", "aria-hidden": "true" }, "\u2304")
  ), open && /* @__PURE__ */ import_react7.default.createElement(AnchoredPopover, { anchor, label: "\u9009\u62E9\u8D1F\u8D23\u4EBA", onClose: () => close(), className: "mw-people-popover" }, /* @__PURE__ */ import_react7.default.createElement("header", null, /* @__PURE__ */ import_react7.default.createElement("strong", null, managing ? "\u5019\u9009\u540D\u5355" : "\u8D1F\u8D23\u4EBA"), onRosterChange && /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "link mw-people-manage",
      disabled: saving,
      onClick: () => {
        setManaging(!managing);
        setQuery("");
        setError("");
      }
    },
    managing ? "\u8FD4\u56DE\u9009\u62E9" : "\u7BA1\u7406\u540D\u5355"
  ), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "link", "aria-label": "\u5173\u95ED\u8D1F\u8D23\u4EBA\u9009\u62E9", disabled: saving, onClick: () => close(true) }, "\xD7")), managing ? /* @__PURE__ */ import_react7.default.createElement("p", { className: "mw-people-help" }, "\u79FB\u51FA\u7684\u4EBA\u4F1A\u4ECE\u5019\u9009\u4E2D\u9690\u85CF\uFF0C\u5DF2\u6709\u4EFB\u52A1\u7684\u8D1F\u8D23\u4EBA\u8BB0\u5F55\u4F1A\u4FDD\u7559\u3002") : /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-people-selected", "aria-label": "\u5DF2\u9009\u8D1F\u8D23\u4EBA" }, chosen.length ? chosen.map((person) => /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "mw-people-chip-remove",
      key: person,
      "aria-label": "\u4ECE\u5F53\u524D\u4EFB\u52A1\u79FB\u9664 " + person,
      disabled: saving,
      onClick: () => {
        setChosen((previous) => previous.filter((n) => n !== person));
        input.current?.focus();
      }
    },
    /* @__PURE__ */ import_react7.default.createElement("span", null, person),
    /* @__PURE__ */ import_react7.default.createElement("span", { "aria-hidden": "true" }, "\xD7")
  )) : /* @__PURE__ */ import_react7.default.createElement("span", { className: "muted" }, "\u672A\u5206\u914D")), /* @__PURE__ */ import_react7.default.createElement("label", { className: "mw-people-search" }, /* @__PURE__ */ import_react7.default.createElement(WorkspaceIcon, { name: "search", size: 14 }), /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      ref: input,
      "aria-label": managing ? "\u641C\u7D22\u5019\u9009\u540D\u5355" : "\u641C\u7D22\u6216\u65B0\u589E\u8D1F\u8D23\u4EBA",
      placeholder: managing ? "\u641C\u7D22\u8D1F\u8D23\u4EBA" : "\u641C\u7D22\u6216\u65B0\u589E\u8D1F\u8D23\u4EBA",
      maxLength: 80,
      value: query,
      disabled: saving,
      onChange: (e) => setQuery(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
          e.preventDefault();
          if (canAdd) add(name);
        }
      }
    }
  )), /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-people-options" }, candidates.map((person) => managing ? /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-people-roster-row", key: person }, /* @__PURE__ */ import_react7.default.createElement("span", null, person), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "link", "aria-label": "\u4ECE\u5019\u9009\u540D\u5355\u79FB\u51FA " + person, disabled: saving, onClick: () => changeRoster(person, false) }, "\u79FB\u51FA")) : /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "mw-people-option",
      key: person,
      disabled: saving || chosen.length >= 30,
      "aria-label": "\u9009\u62E9 " + person,
      onClick: () => add(person)
    },
    /* @__PURE__ */ import_react7.default.createElement("span", null, person),
    /* @__PURE__ */ import_react7.default.createElement("span", { "aria-hidden": "true" }, "\uFF0B")
  )), removed.length > 0 && /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-people-archived" }, "\u5DF2\u79FB\u51FA"), removed.map((person) => /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-people-roster-row", key: person }, /* @__PURE__ */ import_react7.default.createElement("span", null, person), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "link", "aria-label": "\u6062\u590D\u5019\u9009\u8D1F\u8D23\u4EBA " + person, disabled: saving, onClick: () => changeRoster(person, true) }, "\u6062\u590D"))), !candidates.length && !removed.length && !canAdd && /* @__PURE__ */ import_react7.default.createElement("p", { className: "muted small" }, name ? "\u672A\u627E\u5230\u8D1F\u8D23\u4EBA" : "\u6CA1\u6709\u5176\u4ED6\u8D1F\u8D23\u4EBA")), canAdd && /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mw-add-person", disabled: saving, onClick: () => add(name) }, "\uFF0B \u6DFB\u52A0\u300C", name, "\u300D"), error && /* @__PURE__ */ import_react7.default.createElement("p", { className: "mw-inline-error", role: "alert" }, error), !managing && /* @__PURE__ */ import_react7.default.createElement("footer", null, /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "link", disabled: saving || !chosen.length, onClick: () => setChosen([]) }, "\u6E05\u7A7A"), /* @__PURE__ */ import_react7.default.createElement("span", null, chosen.length, " \u4EBA"), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", disabled: saving, onClick: () => close(true) }, "\u53D6\u6D88"), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "primary", disabled: saving, onClick: save }, saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u8D1F\u8D23\u4EBA"))));
}
function TitleCell({ task, onSave }) {
  const [editing, setEditing] = (0, import_react7.useState)(false), [text, setText] = (0, import_react7.useState)(""), [error, setError] = (0, import_react7.useState)(""), [saving, setSaving] = (0, import_react7.useState)(false);
  const input = (0, import_react7.useRef)(null), pending = (0, import_react7.useRef)(false), cancelled = (0, import_react7.useRef)(false), original = (0, import_react7.useRef)(task.title);
  (0, import_react7.useEffect)(() => {
    if (editing) {
      input.current?.focus();
      input.current?.setSelectionRange(text.length, text.length);
    }
  }, [editing]);
  async function save() {
    if (cancelled.current || pending.current) return;
    if (text.trim() === original.current) {
      setEditing(false);
      return;
    }
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      await onSave("title", text, { title: original.current });
      setEditing(false);
    } catch (e) {
      setError(e.message);
      input.current?.focus();
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return editing ? /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-inline-title" }, /* @__PURE__ */ import_react7.default.createElement("textarea", { ref: input, "aria-label": "\u4FEE\u6539\u4EFB\u52A1\u5185\u5BB9", rows: 3, maxLength: 1e3, value: text, disabled: saving, onChange: (e) => setText(e.target.value), onBlur: save, onKeyDown: (e) => {
    if (e.isComposing || e.nativeEvent.isComposing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      cancelled.current = true;
      setEditing(false);
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      save();
    }
  } }), /* @__PURE__ */ import_react7.default.createElement("small", null, saving ? "\u4FDD\u5B58\u4E2D\u2026" : "Enter \u4FDD\u5B58 \xB7 Shift+Enter \u6362\u884C \xB7 Esc \u53D6\u6D88"), error && /* @__PURE__ */ import_react7.default.createElement("span", { className: "mw-inline-error", role: "alert" }, error)) : /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "mw-cell-trigger mw-title-trigger" + (task.done ? " done" : ""), "aria-label": "\u7F16\u8F91\u4EFB\u52A1\u5185\u5BB9\uFF1A" + task.title, onClick: () => {
    original.current = task.title;
    cancelled.current = false;
    setText(task.title);
    setError("");
    setEditing(true);
  } }, task.title, /* @__PURE__ */ import_react7.default.createElement("span", { className: "mw-edit-hint", "aria-hidden": "true" }, "\u270E"));
}
function TaskRow({ task, global, projects, people, archived, today: today2, onPatch, onRosterChange, onToggle, onMeeting, onDelete }) {
  const [saving, setSaving] = (0, import_react7.useState)(false), [error, setError] = (0, import_react7.useState)("");
  const save = async (field, value, expected) => {
    setError("");
    setSaving(true);
    try {
      await onPatch(task, { [field]: value }, expected);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  };
  const quiet = (field, value, expected) => save(field, value, expected).catch(() => {
  });
  return /* @__PURE__ */ import_react7.default.createElement("tr", null, /* @__PURE__ */ import_react7.default.createElement("td", { "data-label": "\u4EFB\u52A1\u5185\u5BB9" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-task-title-cell" }, /* @__PURE__ */ import_react7.default.createElement("input", { type: "checkbox", "aria-label": "\u5B8C\u6210 " + task.title, checked: task.done, disabled: saving, onChange: () => onToggle(task) }), /* @__PURE__ */ import_react7.default.createElement(TitleCell, { task, onSave: save })), error && /* @__PURE__ */ import_react7.default.createElement("p", { className: "mw-inline-error", role: "alert" }, error)), /* @__PURE__ */ import_react7.default.createElement("td", { "data-label": "\u8D1F\u8D23\u4EBA" }, /* @__PURE__ */ import_react7.default.createElement(PeoplePicker, { value: taskOwners(task), people, archived, onRosterChange, disabled: saving, label: "\u7F16\u8F91\u8D1F\u8D23\u4EBA\uFF1A" + task.title, onSave: (owners, previous) => save("owners", owners, { owners: previous }) })), /* @__PURE__ */ import_react7.default.createElement("td", { "data-label": "\u622A\u6B62\u65E5\u671F" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-date-cell" + (!task.done && task.due && task.due < today2 ? " overdue" : "") }, /* @__PURE__ */ import_react7.default.createElement("input", { type: "date", min: "1000-01-01", max: "9999-12-31", "aria-label": "\u622A\u6B62\u65E5\u671F\uFF1A" + task.title, value: task.due, disabled: saving, onClick: (e) => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
    }
  }, onChange: (e) => quiet("due", e.target.value, { due: task.due }) }), task.due && /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "link", "aria-label": "\u6E05\u9664\u622A\u6B62\u65E5\u671F\uFF1A" + task.title, disabled: saving, onClick: () => quiet("due", "", { due: task.due }) }, "\xD7"))), global && /* @__PURE__ */ import_react7.default.createElement("td", { "data-label": "\u6765\u6E90\u4F1A\u8BAE" }, /* @__PURE__ */ import_react7.default.createElement("button", { className: "link mw-task-source", onClick: () => onMeeting(task.meetingId) }, task.meetingTitle)), /* @__PURE__ */ import_react7.default.createElement("td", { "data-label": "\u9879\u76EE" }, /* @__PURE__ */ import_react7.default.createElement("select", { className: "mw-project-cell", "aria-label": "\u4EFB\u52A1\u9879\u76EE\uFF1A" + task.title, value: task.project, disabled: saving, onChange: (e) => quiet("project", e.target.value, { project: task.project }) }, projects.map((p) => /* @__PURE__ */ import_react7.default.createElement("option", { key: p.id, value: p.id }, p.name)))), /* @__PURE__ */ import_react7.default.createElement("td", { "data-label": "\u64CD\u4F5C" }, /* @__PURE__ */ import_react7.default.createElement("button", { className: "link danger", disabled: saving, onClick: () => onDelete(task) }, "\u5220\u9664")));
}
function TaskTable({ items, data, global = false, today: today2, onPatch, onRosterChange, onToggle, onMeeting, onDelete }) {
  const people = peopleFor(data, { assignableOnly: true });
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "mw-table mw-editable-tasks" + (global ? " mw-global-tasks" : "") }, /* @__PURE__ */ import_react7.default.createElement("table", null, /* @__PURE__ */ import_react7.default.createElement("thead", null, /* @__PURE__ */ import_react7.default.createElement("tr", null, /* @__PURE__ */ import_react7.default.createElement("th", null, "\u4EFB\u52A1\u5185\u5BB9"), /* @__PURE__ */ import_react7.default.createElement("th", null, "\u8D1F\u8D23\u4EBA"), /* @__PURE__ */ import_react7.default.createElement("th", null, "\u622A\u6B62\u65E5\u671F"), global && /* @__PURE__ */ import_react7.default.createElement("th", null, "\u6765\u6E90\u4F1A\u8BAE"), /* @__PURE__ */ import_react7.default.createElement("th", null, "\u9879\u76EE"), /* @__PURE__ */ import_react7.default.createElement("th", null, "\u64CD\u4F5C"))), /* @__PURE__ */ import_react7.default.createElement("tbody", null, items.map((task) => /* @__PURE__ */ import_react7.default.createElement(TaskRow, { key: task.id, ...{ task, global, projects: data.projects, people, archived: data.archivedTaskPeople, today: today2, onPatch, onRosterChange, onToggle, onMeeting, onDelete } })))), !items.length && /* @__PURE__ */ import_react7.default.createElement("p", { className: "empty" }, "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u4EFB\u52A1"));
}

// src/client/assistant-theme.css
var assistant_theme_default = "/* Workbench-scoped theme for the shipped DSH conversation; no second composer. */\n.mw-assistant-unified{background:#f8f9fc}.mw-assistant-unified .mw-assistant-heading{background:#fff}.mw-assistant-unified .mw-native-thread{flex-direction:column;background:#f8f9fc;position:relative}.mw-assistant-session{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;overflow:hidden}.mw-assistant-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;color:#795bd4;background:#eee8fb}.mw-assistant-unified h2{color:#343246}.mw-assistant-intro{display:none;align-items:flex-start;flex-direction:column;gap:10px;padding:24px 24px 8px;flex:none}.mw-assistant-intro h2{font-size:19px;margin:0}.mw-assistant-intro p{font-size:12px;color:#92909f;margin:0}.mw-assistant-session:has([data-content-phase=hero])>.mw-assistant-intro{display:flex}.mw-assistant-unified .mw-assistant-welcome{gap:13px;padding:24px;align-items:flex-start;text-align:left;width:100%}.mw-assistant-unified .mw-assistant-welcome h2{font-size:20px}.mw-assistant-quick{display:flex;gap:8px;flex-wrap:wrap}.mw-assistant-quick button{font-size:11px!important;background:#fff!important;border-color:#e5dfef!important;color:#8063bd!important;padding:7px 10px!important}.mw-question-bar{position:relative;flex:none;padding:9px 16px 12px;display:flex;gap:10px;align-items:center;background:#f8f9fc}.mw-question-trigger{display:flex;align-items:center;gap:6px;border:0!important;background:transparent!important;color:#795bd4!important;padding:5px 0!important;font-size:11px!important;white-space:nowrap}.mw-question-trigger svg{width:16px;height:16px}.mw-question-bar>span{font-size:10px;color:#a09aa9;line-height:1.5}.mw-question-popup{position:absolute;bottom:calc(100% + 2px);left:14px;right:14px;max-width:460px;background:#fff;border:1px solid #e5dcef;border-radius:14px;box-shadow:0 10px 34px #3a255a24;z-index:20;overflow:hidden}.mw-question-popup>header{padding:12px 15px;border-bottom:1px solid #efebf4;display:flex;justify-content:space-between;align-items:center}.mw-question-popup>header strong{font-size:12px;color:#4e465d}.mw-question-popup>header button{border:0!important;background:transparent!important;font-size:18px!important;padding:0 5px!important;color:#9992a5!important}.mw-question-popup>div{max-height:260px;overflow:auto;overscroll-behavior:contain;padding:6px}.meeting-workspace .mw-question-popup>div>button{width:100%;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) 18px;gap:4px 10px;border:0;border-radius:9px;background:transparent;padding:10px;white-space:normal}.mw-question-popup>div>button:hover,.mw-question-popup>div>button:focus-visible{background:#f5f0fc!important}.mw-question-popup small{font-size:10px;color:#9b8cb2;grid-column:1}.mw-question-popup span{font-size:12px;color:#5d5569;line-height:1.65;overflow-wrap:anywhere;grid-column:1}.mw-question-popup b{font-size:16px;color:#ae9dc4;grid-row:1/3;grid-column:2;align-self:center;font-weight:400}\n.mw-assistant-unified .mw-host-conversation{--dsw-alias-bg-base:#f8f9fc;--dsw-alias-bg-module-platform:#fff;--dsw-specific-input-major:#fff;--dsw-alias-label-primary:#343246;--dsw-alias-label-secondary:#777284;--dsw-alias-label-caption:#a29ba9;--dsw-alias-state-business-primary:#795bd4;--dsw-alias-button-info-fill:#795bd4;--dsw-alias-button-info-hover:#694bc2;--dsw-alias-state-business-tertiary:#f0eafa;--dsw-alias-border-l2:#e6dff0;--dsw-radius-panel:14px;--dsw-radius-md:8px;--dsh-content-font-size:13px;--dsh-content-font-delta:0px;--dsw-font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f9fc}\n.mw-assistant-unified .mw-host-conversation [data-conversation-content]{--dsh-chat-content-width:calc(100% - 28px);--dsh-composer-card-max-width:100%;--dsh-composer-side-clearance:0px;--dsh-composer-dock-inset:0px;min-width:0;background:#f8f9fc}.mw-assistant-unified .mw-host-conversation [data-conversation-content][data-content-phase=hero] [data-conversation-scroll]{justify-content:flex-end!important}.mw-assistant-unified .mw-host-conversation [data-composer-seat]{padding:10px 14px 4px;--dsh-composer-text-max-height:128px}.mw-assistant-unified .mw-host-conversation [data-content-phase=hero] [class*=_composerHero]{width:100%;padding-bottom:0;gap:4px}.mw-assistant-unified .mw-host-conversation [data-content-phase=hero] [class*=_composerHero]>:first-child,.mw-assistant-unified .mw-host-conversation [data-content-phase=hero] [class*=_heroWorkspaceRow]{display:none!important}.mw-assistant-unified .mw-host-conversation [data-composer-card]{border:1px solid #e6dff0!important;border-radius:14px!important;background:#fff!important;box-shadow:0 3px 12px #3e275508!important;gap:8px!important}.mw-assistant-unified .mw-host-conversation [data-composer-input]{font:13px/1.75 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;min-height:48px!important;padding:7px 12px 3px!important;color:#4c4658!important}.mw-assistant-unified .mw-host-conversation [data-composer-placeholder]{font-size:0!important;padding-top:3px}.mw-assistant-unified .mw-host-conversation [data-composer-placeholder]:after{content:'\u8F93\u5165\u4F1A\u8BAE\u95EE\u9898\u6216\u5B89\u6392\u2026';font-size:12px;line-height:1.8;color:#aaa2b3}.mw-assistant-unified .mw-host-conversation [data-composer-card] button{font-family:inherit}.mw-assistant-unified .mw-host-conversation [class*=_headerBlank]{padding:0 14px!important;min-height:0!important}.mw-assistant-unified .mw-host-conversation [data-conversation-tabs]{font-size:12px}.mw-assistant-unified .mw-assistant-sources{background:#f7f5fa}.mw-assistant-unified .mw-source-hit{border-radius:10px!important;border-color:#e8e1f0!important}\n.mw-assistant-unified.mw-assistant-compact .mw-assistant-heading{padding:8px 14px;border-bottom:0;background:#f8f9fc}.mw-assistant-compact .mw-assistant-intro{padding:14px 18px 6px;gap:8px}.mw-assistant-compact .mw-assistant-intro .mw-assistant-mark{width:32px;height:32px;border-radius:10px}.mw-assistant-compact .mw-assistant-intro h2{font-size:16px}.mw-assistant-compact .mw-assistant-intro p{font-size:11px}.mw-assistant-compact .mw-question-popup>div{max-height:220px}.mw-assistant-compact .mw-question-bar{padding:7px 14px 10px}.mw-assistant-compact .mw-assistant-sources{max-height:90px}\n@container(max-width:560px){.mw-assistant-unified .mw-assistant-heading{padding:12px 16px}.mw-assistant-unified .mw-assistant-heading .actions{width:auto}.mw-assistant-intro{padding:18px 16px 6px}.mw-question-popup{left:10px;right:10px}.mw-question-popup>div{max-height:230px}.mw-question-bar>span{font-size:9px}.mw-assistant-unified .mw-host-conversation [data-composer-seat]{padding:8px 10px 3px}}\n.mw-chat-retry { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: space-between; }\n";

// src/client/recording-mode.mjs
async function resolveRecordingMode({ live = true, readCapabilities, prepare }) {
  if (live === false) return false;
  let caps = await readCapabilities();
  if (!caps.asrConfigured && caps.localSpeech?.supported) {
    await prepare();
    caps = await readCapabilities();
  }
  if (!caps.asrConfigured) throw Error("\u672C\u5730\u8F6C\u5199\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5728\u201C\u8BBE\u7F6E\u201D\u67E5\u770B\u6A21\u578B\u51C6\u5907\u8FDB\u5EA6\u3002\u4E5F\u53EF\u53D6\u6D88\u201C\u540C\u6B65\u8F6C\u5199\u201D\u4EC5\u4FDD\u5B58\u5F55\u97F3\u3002");
  return true;
}
async function resolveRecordingModel({ live = true, id, readModels, prepare }) {
  const catalog = await readModels();
  const asrModel = id || catalog?.selected;
  const model = catalog?.models.find((m) => m.id === asrModel);
  if (!model) throw Error("\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u9009\u62E9\u8BED\u97F3\u8F6C\u5199\u6A21\u578B");
  if (live !== false) {
    if (!model.available) throw Error(model.mode === "streaming" ? "\u5F53\u524D\u8BBE\u5907\u65E0\u6CD5\u4F7F\u7528 X-ASR\uFF0C\u8BF7\u9009\u62E9 SenseVoiceSmall \u6216\u4EC5\u5F55\u97F3\u3002" : "DSH \u672C\u5730\u8BED\u97F3\u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u51C6\u5907\u6A21\u578B\u3002");
    if (model.mode === "segmented") await resolveRecordingMode({ prepare: () => prepare(asrModel), readCapabilities: async () => {
      const current = (await readModels()).models.find((m) => m.id === asrModel);
      return { asrConfigured: current?.ready, localSpeech: { supported: current?.available } };
    } });
  }
  return { live: live !== false, asrModel, language: model.mode === "streaming" ? "auto" : void 0 };
}

// src/client/recorder.mjs
function resample(samples, from, to = 16e3) {
  if (from === to) return samples;
  const ratio = from / to, out = new Float32Array(Math.round(samples.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio), end = Math.min(samples.length, Math.max(start + 1, Math.floor((i + 1) * ratio)));
    let total = 0;
    for (let j = start; j < end; j++) total += samples[j];
    out[i] = total / (end - start);
  }
  return out;
}
async function speechParts(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer()), v = new DataView(bytes.buffer);
  let data;
  for (let at = 12; at + 8 <= bytes.length; ) {
    const size = v.getUint32(at + 4, true), end = at + 8 + size;
    if (end > bytes.length) throw Error("WAV \u97F3\u9891\u4E0D\u5B8C\u6574");
    if (v.getUint32(at, false) === 1684108385) {
      data = bytes.subarray(at + 8, end);
      break;
    }
    at = end + size % 2;
  }
  if (!data?.length || data.length % 2) throw Error("WAV \u97F3\u9891\u6CA1\u6709\u6709\u6548\u6570\u636E");
  const parts = [];
  for (let at = 0; at < data.length; at += 192e4) {
    const pcm = data.subarray(at, at + 192e4), part = new Uint8Array(44 + pcm.length);
    part.set(new Uint8Array(await wav(new Float32Array(0), 16e3).arrayBuffer()));
    part.set(pcm, 44);
    const header = new DataView(part.buffer);
    header.setUint32(4, 36 + pcm.length, true);
    header.setUint32(40, pcm.length, true);
    parts.push(part);
  }
  return parts;
}
async function speechWav(blob) {
  const bytes = await blob.arrayBuffer();
  if (bytes.byteLength >= 44) {
    const d = new DataView(bytes);
    if (d.getUint32(0, false) === 1380533830 && d.getUint32(24, true) === 16e3 && d.getUint16(22, true) === 1 && d.getUint16(34, true) === 16) return blob;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audio = new AudioCtx();
  try {
    const decoded = await audio.decodeAudioData(bytes);
    const mono = new Float32Array(decoded.length);
    for (let c = 0; c < decoded.numberOfChannels; c++) {
      const channel = decoded.getChannelData(c);
      for (let i = 0; i < mono.length; i++) mono[i] += channel[i] / decoded.numberOfChannels;
    }
    return wav(resample(mono, decoded.sampleRate), 16e3);
  } catch {
    throw Error("\u5F53\u524D\u5BBF\u4E3B\u65E0\u6CD5\u89E3\u7801\u6B64\u97F3\u9891\uFF0C\u8BF7\u8F6C\u6362\u4E3A WAV \u6216 M4A \u540E\u518D\u8F6C\u5199");
  } finally {
    await audio.close();
  }
}
function wav(samples, rate) {
  const data = new ArrayBuffer(44 + samples.length * 2), v = new DataView(data);
  const ascii = (at, s) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)));
  ascii(0, "RIFF");
  v.setUint32(4, 36 + samples.length * 2, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  ascii(36, "data");
  v.setUint32(40, samples.length * 2, true);
  samples.forEach((x, i) => v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x)) * (x < 0 ? 32768 : 32767), true));
  return new Blob([data], { type: "audio/wav" });
}
var BrowserRecorder = class {
  constructor({ onState, onTranscript, transcribe, language = "zh", retainPCM = false }) {
    this.retainPCM = retainPCM;
    this.pcmSamples = [];
    this.language = language;
    this.interim = /* @__PURE__ */ new Map();
    this.streamStatus = "";
    this.onState = onState;
    this.onTranscript = onTranscript;
    this.transcribe = transcribe;
    this.chunks = [];
    this.samples = [];
    this.chain = Promise.resolve();
    this.pending = 0;
    this.errors = [];
    this.seconds = 0;
    this.level = 0;
    this.levels = Array(25).fill(0);
    this.paused = false;
    this.active = false;
  }
  async start(live) {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw Error("\u5F53\u524D\u5BBF\u4E3B\u672A\u63D0\u4F9B\u9EA6\u514B\u98CE\u5F55\u97F3\u63A5\u53E3");
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.media = new MediaRecorder(this.stream);
      this.media.ondataavailable = (e) => {
        if (e.data.size) this.chunks.push(e.data);
      };
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) throw Error("\u5F53\u524D\u5BBF\u4E3B\u672A\u63D0\u4F9B\u97F3\u9891\u5206\u6790\u63A5\u53E3");
      this.audio = new AudioCtx();
      await this.audio.resume();
      this.input = this.audio.createMediaStreamSource(this.stream);
      this.processor = this.audio.createScriptProcessor(4096, 1, 1);
      this.silent = this.audio.createGain();
      this.silent.gain.value = 0;
      this.input.connect(this.processor);
      this.processor.connect(this.silent);
      this.silent.connect(this.audio.destination);
      this.rate = this.audio.sampleRate;
      this.live = live;
      this.processor.onaudioprocess = (e) => {
        if (!this.active || this.paused) return;
        const s = e.inputBuffer.getChannelData(0);
        let total = 0;
        for (const x of s) total += x * x;
        this.level = Math.sqrt(total / s.length);
        this.levels = [...this.levels.slice(1), this.level];
        this.emit();
        if (this.retainPCM) this.pcmSamples.push(new Float32Array(s));
        if (this.live) {
          this.samples.push(new Float32Array(s));
          if (this.samples.reduce((n, a) => n + a.length, 0) >= this.rate * 6) this.flush();
        }
      };
      this.active = true;
      this.started = performance.now();
      this.pauseTotal = 0;
      this.media.start(1e3);
      this.clock = setInterval(() => {
        this.seconds = Math.floor(((this.pauseAt || performance.now()) - this.started - this.pauseTotal) / 1e3);
        this.emit();
      }, 500);
      this.emit();
    } catch (e) {
      this.stream?.getTracks().forEach((t) => t.stop());
      await this.audio?.close().catch(() => {
      });
      throw e;
    }
  }
  emit() {
    this.onState({ interim: [...this.interim.values()], streaming: false, seconds: this.seconds, level: this.paused ? 0 : this.level, levels: this.paused ? Array(25).fill(0) : this.levels, paused: this.paused, pending: this.pending, status: this.paused ? "\u5F55\u97F3\u5DF2\u6682\u505C" : this.errors.length ? this.errors.at(-1) : this.live ? this.pending ? "\u6B63\u5728\u8BC6\u522B\u5206\u6BB5\u97F3\u9891\u2026" : this.level > 2e-3 ? "\u5DF2\u6536\u5230\u58F0\u97F3\uFF0C\u7B49\u5F85\u4E0B\u4E00\u6BB5\u8BC6\u522B" : "\u7B49\u5F85\u58F0\u97F3\u8F93\u5165" : "\u672C\u6B21\u4EC5\u5F55\u97F3\uFF0C\u53EF\u5728\u9762\u677F\u5F00\u542F\u5B9E\u65F6\u8F6C\u5199" });
  }
  flush() {
    if (!this.samples.length) return;
    const length = this.samples.reduce((n, a) => n + a.length, 0), all = new Float32Array(length);
    let at = 0;
    for (const a of this.samples) {
      all.set(a, at);
      at += a.length;
    }
    this.samples = [];
    const time2 = Math.max(0, ((this.pauseAt || performance.now()) - this.started - this.pauseTotal) / 1e3 - length / this.rate);
    let energy = 0;
    for (const x of all) energy += x * x;
    if (Math.sqrt(energy / all.length) < 2e-3) return;
    this.pending++;
    this.emit();
    const blob = wav(resample(all, this.rate), 16e3);
    this.chain = this.chain.then(async () => {
      try {
        const text = await this.transcribe(blob);
        this.errors = [];
        if (text.trim()) this.onTranscript({ id: crypto.randomUUID(), time: `${String(Math.floor(time2 / 60)).padStart(2, "0")}:${String(Math.floor(time2 % 60)).padStart(2, "0")}`, speaker: "\u53D1\u8A00\u4EBA", text: text.trim(), final: true });
      } catch (e) {
        this.errors.push("\u8F6C\u5199\u5931\u8D25\uFF1A" + e.message);
      } finally {
        this.pending--;
        this.emit();
      }
    });
  }
  async enableTranscription() {
    if (!this.active) throw Error("\u5F55\u97F3\u5C1A\u672A\u5F00\u59CB");
    this.samples = [];
    this.live = true;
    this.errors = [];
    this.emit();
  }
  async pause() {
    if (this.paused) {
      this.pauseTotal += performance.now() - this.pauseAt;
      this.pauseAt = 0;
      this.paused = false;
      this.media.resume();
      this.audio.resume();
    } else {
      this.flush();
      this.paused = true;
      this.pauseAt = performance.now();
      this.media.pause();
      this.audio.suspend();
    }
    this.emit();
  }
  async stop() {
    if (!this.active) return this.blob;
    this.seconds = Math.floor(((this.pauseAt || performance.now()) - this.started - this.pauseTotal) / 1e3);
    this.flush();
    this.active = false;
    clearInterval(this.clock);
    await new Promise((resolve) => {
      this.media.onstop = resolve;
      this.media.stop();
    });
    this.stream.getTracks().forEach((t) => t.stop());
    this.input.disconnect();
    this.processor.disconnect();
    this.silent.disconnect();
    await this.audio.close();
    this.blob = new Blob(this.chunks, { type: this.media.mimeType || "audio/webm" });
    await this.chain;
    return this.blob;
  }
  speechBlob() {
    if (!this.retainPCM || !this.pcmSamples.length || !this.rate) throw Error("\u672A\u6536\u5230\u6709\u6548\u9EA6\u514B\u98CE\u97F3\u9891\uFF0C\u8BF7\u91CD\u8BD5");
    const length = this.pcmSamples.reduce((n, a) => n + a.length, 0), samples = new Float32Array(length);
    let at = 0;
    for (const chunk of this.pcmSamples) {
      samples.set(chunk, at);
      at += chunk.length;
    }
    return wav(resample(samples, this.rate), 16e3);
  }
  dispose() {
    this.pcmSamples = [];
    clearInterval(this.clock);
    this.active = false;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.audio?.close().catch(() => {
    });
  }
};

// src/client/native-recorder.mjs
var API = "/api/meeting-workspace";
var NativeRecorder = class {
  constructor({ meetingId, onState, onTranscript, language = "auto", captureMode = "system-microphone", expectedModel }) {
    Object.assign(this, { meetingId, onState, onTranscript, language, captureMode, expectedModel });
    this.isNative = true;
    this.cursor = 0;
    this.seen = /* @__PURE__ */ new Set();
    this.seconds = 0;
    this.levels = Array(25).fill(0);
  }
  async call(path, body) {
    const r = await fetch(API + path, { cache: "no-store", ...body === void 0 ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, signal: AbortSignal.timeout(18e4) });
    const value = await readAPIResponse(r);
    if (!r.ok) throw Error(value.error || "\u672C\u673A\u97F3\u9891\u91C7\u96C6\u5931\u8D25");
    return value;
  }
  async start(live) {
    this.live = live;
    const state = await this.call("/capture", { meetingId: this.meetingId, language: this.language, live, captureMode: this.captureMode, expectedModel: this.expectedModel, confirmed: true, background: true });
    this.id = state.id;
    if (this.cancelled) {
      await this.call("/capture/control", { id: this.id, action: "stop" });
      throw Error("\u5F55\u97F3\u5DF2\u53D6\u6D88");
    }
    this.apply(state);
    this.poll();
  }
  async attach(id) {
    this.id = id;
    const state = await this.call("/capture/events?id=" + id + "&after=0");
    this.live = state.live;
    this.apply(state);
    this.poll();
  }
  apply(state) {
    this.state = state;
    this.seconds = Math.floor(state.seconds || 0);
    for (const event of state.events || []) {
      if (event.serial <= this.cursor) continue;
      this.cursor = event.serial;
      if (event.type === "transcript" && !this.seen.has(event.row.id)) {
        this.seen.add(event.row.id);
        this.onTranscript(event.row);
      }
      if (event.type === "speaker-labels") for (const row of event.rows || []) this.onTranscript(row);
      if (event.type === "warning" || event.type === "error") this.warning = event.message;
    }
    this.cursor = Math.max(this.cursor, state.cursor || 0);
    const ended = ["saved", "failed"].includes(state.state), paused = state.paused === true, level = paused || ended ? 0 : Math.max(state.microphoneLevel || 0, state.systemLevel || 0);
    this.levels = [...this.levels.slice(1), level];
    this.onState({ native: true, error: state.error || "", asrModel: state.asrModel, speakerState: state.speakerState, seconds: this.seconds, paused, ended, starting: state.state === "starting", stopping: state.state === "stopping", pending: state.pending || 0, level, levels: this.levels, microphoneLevel: state.microphoneLevel || 0, systemLevel: state.systemLevel || 0, microphoneRecovering: state.microphoneRecovering === true, microphoneDevice: state.microphoneDevice || "", microphoneFallback: state.microphoneFallback === true, microphoneFrames: state.microphoneFrames || 0, systemFrames: state.systemFrames || 0, resync: state.resync, streaming: state.streaming === true, interim: state.interim || [], status: state.error || !ended && !paused && state.microphoneStatus || this.warning || (ended ? "\u5F55\u97F3\u5DF2\u4FDD\u5B58" : state.state === "starting" ? state.startupStatus || "\u6B63\u5728\u542F\u52A8\u97F3\u9891\u91C7\u96C6\uFF0C\u5C1A\u672A\u5F00\u59CB\u5F55\u97F3" : state.state === "stopping" ? "\u6B63\u5728\u4FDD\u5B58\u97F3\u9891\u548C\u9010\u5B57\u7A3F\u2026" : paused ? "\u5F55\u97F3\u5DF2\u6682\u505C" : state.microphoneRecovering ? "\u9EA6\u514B\u98CE\u8FDE\u63A5\u4E2D\uFF0C\u90E8\u5206\u58F0\u97F3\u6682\u65E0\u6CD5\u91C7\u96C6\uFF1B\u6B63\u5728\u5C1D\u8BD5\u91CD\u8FDE\u2026" : state.pending ? "DSH \u6B63\u5728\u8F6C\u5199\u6DF7\u5408\u97F3\u9891\u2026" : state.streaming ? "\u672C\u673A\u6D41\u5F0F\u8F6C\u5199\u4E2D" : this.live ? "\u53CC\u8DEF\u5F55\u97F3\u4E2D\uFF0C\u7B49\u5F85\u4E0B\u4E00\u6BB5\u8BC6\u522B" : "\u53CC\u8DEF\u5F55\u97F3\u4E2D") });
  }
  poll() {
    if (this.cancelled || ["saved", "failed"].includes(this.state?.state)) return;
    this.timer = setTimeout(async () => {
      try {
        this.apply(await this.call("/capture/events?id=" + this.id + "&after=" + this.cursor));
      } catch {
        this.onState({ ...this.state, native: true, seconds: this.seconds, status: "\u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6\u91C7\u96C6\u72B6\u6001\uFF0C\u8BF7\u4FDD\u7559\u5DE5\u4F5C\u53F0\u5E76\u91CD\u8BD5", level: 0, levels: this.levels });
      }
      this.poll();
    }, 500);
  }
  async pause() {
    if (!this.id) return;
    this.apply(await this.call("/capture/control", { id: this.id, action: this.state.paused ? "resume" : "pause" }));
  }
  async enableTranscription() {
    this.apply(await this.call("/capture/control", { id: this.id, action: "enable-transcription" }));
    this.live = true;
  }
  async stop() {
    clearTimeout(this.timer);
    try {
      this.apply(await this.call("/capture/control", { id: this.id, action: "stop", background: true }));
      const until = Date.now() + 18e4;
      while (!["saved", "failed"].includes(this.state.state)) {
        if (this.cancelled) throw Error("\u5F55\u97F3\u6B63\u5728\u540E\u53F0\u4FDD\u5B58\uFF0C\u53EF\u91CD\u65B0\u6253\u5F00\u4F1A\u8BAE\u67E5\u770B");
        if (Date.now() > until) throw Error("\u5F55\u97F3\u6B63\u5728\u4FDD\u5B58\u6216\u8865\u8F6C\uFF0C\u8BF7\u4FDD\u7559\u5DE5\u4F5C\u53F0\u5E76\u7A0D\u540E\u67E5\u770B");
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.apply(await this.call("/capture/events?id=" + this.id + "&after=" + this.cursor));
      }
      return this.state;
    } finally {
      if (!this.cancelled && !["saved", "failed"].includes(this.state?.state)) this.poll();
    }
  }
  dispose() {
    this.cancelled = true;
    clearTimeout(this.timer);
  }
};

// src/client/meeting-plan-editor.jsx
var import_react8 = __toESM(require("react"), 1);

// src/plan-management.mjs
var fields = ["title", "startsAt", "project", "agenda", "link", "captureMode", "live", "status", "remindAt", "meetingId", "deletedAt"];
function planVersion(plan) {
  return JSON.stringify(fields.map((key) => plan?.[key] ?? null));
}
function currentPlan(data, id, expected) {
  const plan = data.plans?.find((p) => p.id === id);
  if (!plan || plan.deletedAt) throw Error("\u4F1A\u8BAE\u5B89\u6392\u5DF2\u5220\u9664\uFF0C\u8BF7\u5173\u95ED\u540E\u91CD\u65B0\u67E5\u770B");
  if (expected && planVersion(plan) !== expected) throw Error("\u4F1A\u8BAE\u5B89\u6392\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u5173\u95ED\u540E\u91CD\u65B0\u6253\u5F00\uFF0C\u907F\u514D\u8986\u76D6\u5176\u4ED6\u4FEE\u6539");
  return plan;
}
function savePlan(data, draft, expected) {
  const previous = draft.id ? currentPlan(data, draft.id, expected) : null;
  if (previous?.status === "\u5DF2\u5F00\u59CB") throw Error("\u8BE5\u5B89\u6392\u5DF2\u5F00\u59CB\u8BB0\u5F55\uFF0C\u4E0D\u80FD\u91CD\u65B0\u5B89\u6392\uFF1B\u53EF\u7F16\u8F91\u5BF9\u5E94\u4F1A\u8BAE\u8BB0\u5F55");
  if (typeof draft.title !== "string" || !draft.title.trim() || draft.title.trim().length > 200) throw Error("\u8BF7\u586B\u5199 1 \u81F3 200 \u5B57\u7684\u4F1A\u8BAE\u540D\u79F0");
  if (typeof draft.startsAt !== "string" || !Number.isFinite(Date.parse(draft.startsAt))) throw Error("\u8BF7\u586B\u5199\u6709\u6548\u7684\u4F1A\u8BAE\u65E5\u671F\u548C\u65F6\u95F4");
  if (!data.projects.some((p) => p.id === draft.project)) throw Error("\u6240\u5C5E\u9879\u76EE\u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
  if (typeof draft.agenda !== "string" || draft.agenda.length > 2e4) throw Error("\u8BAE\u9898\u5185\u5BB9\u8FC7\u957F");
  if (draft.link && (typeof draft.link !== "string" || draft.link.length > 4e3 || !/^https?:\/\//i.test(draft.link))) throw Error("\u4F1A\u8BAE\u94FE\u63A5\u987B\u4EE5 http:// \u6216 https:// \u5F00\u5934");
  if (!["microphone", "system-microphone"].includes(draft.captureMode)) throw Error("\u8BF7\u9009\u62E9\u6709\u6548\u91C7\u96C6\u65B9\u5F0F");
  const startsAt = new Date(draft.startsAt).toISOString(), changedTime = previous && Date.parse(previous.startsAt) !== Date.parse(startsAt);
  const plan = { ...previous, id: previous?.id || crypto.randomUUID(), title: draft.title.trim(), startsAt, project: draft.project, agenda: draft.agenda, link: draft.link || "", captureMode: draft.captureMode, live: draft.live !== false, status: !previous || changedTime || previous.status === "\u63D0\u9192\u4E2D" ? "\u5DF2\u5B89\u6392" : previous.status, lastError: "" };
  if (!previous || changedTime || previous.status === "\u63D0\u9192\u4E2D") plan.remindAt = startsAt;
  if (previous && previous.title !== plan.title) plan.autoTitle = false;
  if (previous?.source === "system-calendar") plan.localOverride = true;
  data.plans ||= [];
  const index = data.plans.findIndex((p) => p.id === plan.id);
  if (index < 0) data.plans.push(plan);
  else data.plans[index] = plan;
  return plan;
}
function deletePlan(data, id, expected, now = /* @__PURE__ */ new Date()) {
  const plan = currentPlan(data, id, expected);
  plan.deletedStatus = plan.status;
  plan.deletedAt = now.toISOString();
  plan.status = "\u5DF2\u53D6\u6D88";
  plan.lastError = "";
  return { id, deletedAt: plan.deletedAt };
}
function restorePlan(data, token) {
  const plan = data.plans?.find((p) => p.id === token.id);
  if (!plan?.deletedAt || plan.deletedAt !== token.deletedAt) throw Error("\u8BE5\u5B89\u6392\u5DF2\u53D1\u751F\u53D8\u5316\uFF0C\u65E0\u6CD5\u64A4\u9500");
  plan.status = plan.deletedStatus === "\u63D0\u9192\u4E2D" ? "\u5F85\u786E\u8BA4" : plan.deletedStatus || "\u5DF2\u5B89\u6392";
  delete plan.deletedAt;
  delete plan.deletedStatus;
  return plan;
}

// src/meeting-invitation.mjs
var datePattern = /\b(\d{4})(?:年|[./-])\s*(\d{1,2})(?:月|[./-])\s*(\d{1,2})(?!\d)(?:日|号)?/;
var timePattern = /(?:^|[^\d])(?:(上午|下午|中午|晚上|凌晨)\s*)?(\d{1,2}):(\d{2})(?!\d)(?:\s*(AM|PM)\b)?/i;
var zonePattern = /(?:GMT|UTC)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?|\b(?:GMT|UTC)\b(?!\s*[+-])|中国标准时间|北京时间|China Standard Time|Beijing Time/i;
var timeLabel = /^(?:会议时间|开始时间|日程时间|时间|meeting time|start time|time)\s*:\s*/i;
var dateLabel = /^(?:会议日期|开始日期|日期|meeting date|date)\s*:\s*/i;
var meetingHosts = /* @__PURE__ */ new Set(["vc.feishu.cn", "vc.larksuite.com", "meeting.tencent.com", "meeting.qq.com", "wemeet.tencent.com"]);
var twoDigits = (number) => String(number).padStart(2, "0");
function calendarDate(value) {
  const match = value.match(datePattern);
  if (!match) return "";
  const [, year, month, day] = match;
  const date = `${year}-${twoDigits(month)}-${twoDigits(day)}`;
  const parsed = /* @__PURE__ */ new Date(date + "T00:00:00Z");
  return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === date ? date : "";
}
function clockTime(value) {
  const match = value.match(timePattern);
  if (!match) return "";
  const [, chinese, hours, minutes, english] = match;
  let hour = Number(hours);
  if (hour > 23 || Number(minutes) > 59) return "";
  if (english) {
    if (hour < 1 || hour > 12) return "";
    hour = hour % 12 + (english.toUpperCase() === "PM" ? 12 : 0);
  } else if (["\u4E0B\u5348", "\u4E2D\u5348", "\u665A\u4E0A"].includes(chinese) && hour < 12) {
    hour += 12;
  } else if (chinese === "\u51CC\u6668" && hour === 12) {
    hour = 0;
  }
  return `${twoDigits(hour)}:${minutes}`;
}
function meetingLink(value) {
  const urls = value.match(/https?:\/\/[^\s<>"'，。；）】]+/gi) || [];
  for (const candidate of urls) {
    try {
      const url = new URL(candidate.replace(/[),.;\]}>]+$/, ""));
      if (meetingHosts.has(url.hostname) && url.pathname !== "/" && !url.username && !url.password) return url.href;
    } catch {
    }
  }
  return "";
}
function parseMeetingInvitation(invitation) {
  const originalLines = invitation.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = originalLines.map((line) => line.match(/^(?:会议主题|会议名称|会议标题|日程标题|日程名称|主题|标题|meeting topic|meeting title|subject|topic)\s*[:：]\s*(.+)$/i)?.[1] || line.match(/邀请(?:你|您)参加(?:飞书|腾讯)?(?:视频)?会议\s*[:：]\s*(.+)$/)?.[1]).find(Boolean) || "";
  const lines = originalLines.map((line) => line.replace(/[：＋－／０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248)));
  const dateLine = lines.find((line) => dateLabel.test(line)) || "";
  const startLine = lines.find((line) => /^(?:开始时间|start time)\s*:/i.test(line)) || lines.find((line) => timeLabel.test(line)) || lines.find((line) => line.search(datePattern) === 0) || "";
  const labelIndex = lines.indexOf(startLine);
  const timeLine = timeLabel.test(startLine) && !startLine.replace(timeLabel, "").trim() ? lines[labelIndex + 1] || "" : startLine;
  let date = calendarDate(timeLine) || calendarDate(dateLine);
  const zone = timeLine.match(zonePattern) || lines.find((line) => /^(?:时区|time zone)\s*:/i.test(line))?.match(zonePattern);
  let time2 = clockTime(timeLine.replace(zonePattern, ""));
  if (time2 && zone) {
    const [, sign, hours, minutes] = zone;
    const offset = sign ? Number(hours) * 60 + Number(minutes || 0) : /GMT|UTC/i.test(zone[0]) ? 0 : 480;
    if (!date || offset > 14 * 60 || Number(minutes || 0) > 59) {
      time2 = "";
    } else {
      const local = new Date(Date.parse(`${date}T${time2}:00Z`) - offset * (sign === "-" ? -1 : 1) * 6e4);
      date = `${local.getFullYear()}-${twoDigits(local.getMonth() + 1)}-${twoDigits(local.getDate())}`;
      time2 = `${twoDigits(local.getHours())}:${twoDigits(local.getMinutes())}`;
    }
  }
  return { title: title.slice(0, 200), date, time: time2, link: meetingLink(invitation) };
}

// src/client/meeting-plan-editor.jsx
function MeetingPlanEditor({ plan, data, commit, onClose, onDeleted, onSaved, fromInvitation = false }) {
  const [initial] = (0, import_react8.useState)(() => plan ? { ...plan } : null), [draft, setDraft] = (0, import_react8.useState)(() => plan ? { ...plan, captureMode: plan.captureMode || "system-microphone", agenda: plan.agenda || "", startsAt: new Date(Date.parse(plan.startsAt) - new Date(plan.startsAt).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) } : { title: "", startsAt: "", project: "default", agenda: "", link: "", live: true, captureMode: "system-microphone" }), [busy, setBusy] = (0, import_react8.useState)(false), [error, setError] = (0, import_react8.useState)(""), [confirming, setConfirming] = (0, import_react8.useState)(false);
  const [inviteText, setInviteText] = (0, import_react8.useState)("");
  const [pasting, setPasting] = (0, import_react8.useState)(fromInvitation);
  const begun = initial?.status === "\u5DF2\u5F00\u59CB";
  const [date = "", time2 = ""] = draft.startsAt.split("T");
  const heading = confirming ? "\u5220\u9664\u4F1A\u8BAE\u5B89\u6392" : initial ? "\u7BA1\u7406\u4F1A\u8BAE\u5B89\u6392" : fromInvitation ? "\u6838\u5BF9\u4F1A\u8BAE\u5B89\u6392" : "\u6DFB\u52A0\u4F1A\u8BAE\u5B89\u6392";
  function recognize(event) {
    event.preventDefault();
    if (!inviteText.trim()) {
      setError("\u8BF7\u7C98\u8D34\u4F1A\u8BAE\u9080\u8BF7\u6216\u5165\u4F1A\u94FE\u63A5");
      return;
    }
    const invitation = parseMeetingInvitation(inviteText);
    setDraft((previous) => ({ ...previous, title: invitation.title, link: invitation.link, startsAt: invitation.date + "T" + invitation.time }));
    setError("");
    setPasting(false);
  }
  if (pasting) return /* @__PURE__ */ import_react8.default.createElement("div", { className: "mw-overlay", "data-dsh-no-drag": true }, /* @__PURE__ */ import_react8.default.createElement("form", { className: "mw-dialog", role: "dialog", "aria-modal": "true", "aria-label": "\u7C98\u8D34\u4F1A\u8BAE\u9080\u8BF7", onSubmit: recognize }, /* @__PURE__ */ import_react8.default.createElement("header", null, /* @__PURE__ */ import_react8.default.createElement("h2", null, "\u7C98\u8D34\u4F1A\u8BAE\u9080\u8BF7"), /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", "aria-label": "\u5173\u95ED\u4F1A\u8BAE\u9080\u8BF7", onClick: onClose }, "\xD7")), /* @__PURE__ */ import_react8.default.createElement("p", { className: "muted small" }, "\u590D\u5236\u98DE\u4E66\u6216\u817E\u8BAF\u4F1A\u8BAE\u7684\u9080\u8BF7\u5168\u6587\uFF0C\u8BC6\u522B\u540E\u53EF\u4EE5\u6838\u5BF9\u548C\u8865\u5145\u3002"), /* @__PURE__ */ import_react8.default.createElement("label", null, "\u9080\u8BF7\u5185\u5BB9", /* @__PURE__ */ import_react8.default.createElement("textarea", { required: true, autoFocus: true, rows: 7, maxLength: 12e3, value: inviteText, onChange: (e) => {
    setInviteText(e.target.value);
    setError("");
  }, placeholder: "\u7C98\u8D34\u9080\u8BF7\u5168\u6587\u6216\u5165\u4F1A\u94FE\u63A5\u2026" })), error && /* @__PURE__ */ import_react8.default.createElement("p", { role: "alert", className: "mw-inline-error" }, error), /* @__PURE__ */ import_react8.default.createElement("footer", null, /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ import_react8.default.createElement("button", { type: "submit", className: "primary" }, "\u8BC6\u522B\u9080\u8BF7"))));
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!draft.startsAt || !Number.isFinite(Date.parse(draft.startsAt))) throw Error("\u8BF7\u586B\u5199\u6709\u6548\u4F1A\u8BAE\u65E5\u671F\u548C\u65F6\u95F4");
      await commit((d) => savePlan(d, { ...draft, startsAt: new Date(draft.startsAt).toISOString() }, initial ? planVersion(initial) : void 0));
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      let token;
      await commit((d) => {
        token = deletePlan(d, initial.id, planVersion(initial));
      });
      onDeleted?.(token);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "mw-overlay", "data-dsh-no-drag": true }, /* @__PURE__ */ import_react8.default.createElement("form", { className: "mw-dialog mw-plan-manager", role: "dialog", "aria-modal": "true", "aria-label": heading, onSubmit: confirming ? (e) => e.preventDefault() : save }, /* @__PURE__ */ import_react8.default.createElement("header", null, /* @__PURE__ */ import_react8.default.createElement("h2", null, heading), /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", "aria-label": "\u5173\u95ED\u4F1A\u8BAE\u5B89\u6392\u7BA1\u7406", disabled: busy, onClick: onClose }, "\xD7")), confirming ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("p", null, "\u786E\u5B9A\u5220\u9664\u300C", initial.title, "\u300D\u7684\u4F1A\u8BAE\u5B89\u6392\u5417\uFF1F"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "muted small" }, "\u5220\u9664\u540E\u505C\u6B62\u8BE5\u5B89\u6392\u7684\u63D0\u9192\uFF0C\u5DF2\u6709\u4F1A\u8BAE\u8BB0\u5F55\u3001\u4EFB\u52A1\u548C\u5F55\u97F3\u4F1A\u4FDD\u7559\u3002")) : /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, fromInvitation && /* @__PURE__ */ import_react8.default.createElement("p", { className: "muted small" }, date && time2 ? "\u8BF7\u6309\u672C\u673A\u65F6\u533A\u6838\u5BF9\u4F1A\u8BAE\u540D\u79F0\u3001\u5F00\u59CB\u65F6\u95F4\u548C\u94FE\u63A5\u3002" : "\u8BF7\u8865\u586B\u7F3A\u5C11\u7684\u4F1A\u8BAE\u65E5\u671F\u6216\u5F00\u59CB\u65F6\u95F4\uFF0C\u518D\u6838\u5BF9\u540D\u79F0\u548C\u94FE\u63A5\u3002"), /* @__PURE__ */ import_react8.default.createElement("label", null, "\u4F1A\u8BAE\u540D\u79F0", /* @__PURE__ */ import_react8.default.createElement("input", { "aria-label": "\u5B89\u6392\u4F1A\u8BAE\u540D\u79F0", required: true, maxLength: 200, disabled: busy || begun, value: draft.title, onChange: (e) => setDraft({ ...draft, title: e.target.value }) })), /* @__PURE__ */ import_react8.default.createElement("div", { className: "mw-fields" }, /* @__PURE__ */ import_react8.default.createElement("label", null, "\u4F1A\u8BAE\u65E5\u671F", /* @__PURE__ */ import_react8.default.createElement("input", { "aria-label": "\u5B89\u6392\u4F1A\u8BAE\u65E5\u671F", type: "date", required: true, disabled: busy || begun, value: date, onChange: (e) => setDraft({ ...draft, startsAt: e.target.value + "T" + (time2 || (fromInvitation ? "" : "09:00")) }) })), /* @__PURE__ */ import_react8.default.createElement("label", null, "\u5F00\u59CB\u65F6\u95F4", /* @__PURE__ */ import_react8.default.createElement("input", { "aria-label": "\u5B89\u6392\u5F00\u59CB\u65F6\u95F4", type: "time", required: true, disabled: busy || begun, value: time2 || (fromInvitation ? "" : "09:00"), onChange: (e) => setDraft({ ...draft, startsAt: (date || (fromInvitation ? "" : (/* @__PURE__ */ new Date()).toLocaleDateString("sv-SE"))) + "T" + e.target.value }) }))), /* @__PURE__ */ import_react8.default.createElement("label", null, "\u6240\u5C5E\u9879\u76EE", /* @__PURE__ */ import_react8.default.createElement("select", { "aria-label": "\u5B89\u6392\u6240\u5C5E\u9879\u76EE", disabled: busy || begun, value: draft.project, onChange: (e) => setDraft({ ...draft, project: e.target.value }) }, data.projects.map((p) => /* @__PURE__ */ import_react8.default.createElement("option", { key: p.id, value: p.id }, p.name)))), /* @__PURE__ */ import_react8.default.createElement("label", null, "\u8BAE\u9898\u4E0E\u51C6\u5907\u8D44\u6599", /* @__PURE__ */ import_react8.default.createElement("textarea", { "aria-label": "\u8BAE\u9898\u4E0E\u51C6\u5907\u8D44\u6599", maxLength: 2e4, disabled: busy || begun, value: draft.agenda, onChange: (e) => setDraft({ ...draft, agenda: e.target.value }) })), /* @__PURE__ */ import_react8.default.createElement("label", null, "\u4F1A\u8BAE\u94FE\u63A5\uFF08\u9009\u586B\uFF09", /* @__PURE__ */ import_react8.default.createElement("input", { "aria-label": "\u4F1A\u8BAE\u94FE\u63A5", type: "url", disabled: busy || begun, value: draft.link || "", onChange: (e) => setDraft({ ...draft, link: e.target.value }) })), /* @__PURE__ */ import_react8.default.createElement("label", null, "\u91C7\u96C6\u65B9\u5F0F", /* @__PURE__ */ import_react8.default.createElement("select", { "aria-label": "\u5B89\u6392\u91C7\u96C6\u65B9\u5F0F", disabled: busy || begun, value: draft.captureMode || "system-microphone", onChange: (e) => setDraft({ ...draft, captureMode: e.target.value }) }, /* @__PURE__ */ import_react8.default.createElement("option", { value: "system-microphone" }, "\u7535\u8111\u58F0\u97F3\uFF0B\u9EA6\u514B\u98CE"), /* @__PURE__ */ import_react8.default.createElement("option", { value: "microphone" }, "\u4EC5\u9EA6\u514B\u98CE"))), /* @__PURE__ */ import_react8.default.createElement("label", { className: "inline" }, /* @__PURE__ */ import_react8.default.createElement("input", { type: "checkbox", disabled: busy || begun, checked: draft.live !== false, onChange: (e) => setDraft({ ...draft, live: e.target.checked }) }), "\u5F00\u59CB\u540E\u540C\u6B65\u8F6C\u5199\uFF08\u81EA\u52A8\u8BC6\u522B\u8BED\u8A00\uFF09"), initial?.source === "system-calendar" && /* @__PURE__ */ import_react8.default.createElement("p", { className: "muted small" }, "\u6B64\u5904\u7BA1\u7406\u672C\u5730\u5B89\u6392\uFF0C\u4E0D\u4FEE\u6539\u7CFB\u7EDF\u65E5\u5386\u3002"), begun && /* @__PURE__ */ import_react8.default.createElement("p", { className: "muted small" }, "\u8BE5\u5B89\u6392\u5DF2\u5F00\u59CB\u8BB0\u5F55\uFF0C\u53EF\u5728\u4F1A\u8BAE\u8BB0\u5F55\u4E2D\u7F16\u8F91\u4F1A\u8BAE\u5185\u5BB9\u3002")), error && /* @__PURE__ */ import_react8.default.createElement("p", { role: "alert", className: "mw-inline-error" }, error), /* @__PURE__ */ import_react8.default.createElement("footer", null, confirming ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", disabled: busy, onClick: () => setConfirming(false) }, "\u8FD4\u56DE"), /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", className: "danger", disabled: busy, onClick: remove }, busy ? "\u5220\u9664\u4E2D\u2026" : "\u786E\u8BA4\u5220\u9664\u5B89\u6392")) : /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, initial && /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", className: "danger mw-plan-delete", disabled: busy, onClick: () => setConfirming(true) }, "\u5220\u9664\u5B89\u6392"), fromInvitation && /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", disabled: busy, onClick: () => {
    setError("");
    setPasting(true);
  } }, "\u8FD4\u56DE\u9080\u8BF7"), /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", disabled: busy, onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ import_react8.default.createElement("button", { type: "submit", className: "primary", disabled: busy || begun }, busy ? "\u4FDD\u5B58\u4E2D\u2026" : initial ? "\u4FDD\u5B58\u4FEE\u6539" : "\u4FDD\u5B58\u5B89\u6392")))));
}

// src/client/meeting-preparation.jsx
var import_react10 = __toESM(require("react"), 1);

// src/client/calendar-panel.jsx
var import_react9 = __toESM(require("react"), 1);
function CalendarPanel({ data, busy, run, commit, api: api2, refresh }) {
  const [calendars, setCalendars] = (0, import_react9.useState)(null), [ids, setIds] = (0, import_react9.useState)(data.calendarConfig?.ids || []), [project, setProject] = (0, import_react9.useState)(data.calendarConfig?.project || "default"), [result, setResult] = (0, import_react9.useState)("");
  return /* @__PURE__ */ import_react9.default.createElement("section", { className: "mw-card mw-calendar-panel" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "mw-card-head" }, /* @__PURE__ */ import_react9.default.createElement("h2", null, "\u65E5\u5386\u540C\u6B65"), /* @__PURE__ */ import_react9.default.createElement("button", { disabled: busy, onClick: () => run(async () => {
    const value = await api2("/calendar/connect", {});
    setCalendars(value.calendars || []);
    setResult(value.calendars?.length ? "\u8BF7\u9009\u62E9\u9700\u8981\u540C\u6B65\u7684\u65E5\u5386" : "\u6CA1\u6709\u627E\u5230\u7CFB\u7EDF\u65E5\u5386\uFF0C\u8BF7\u5148\u5728 Mac \u65E5\u5386\u4E2D\u6DFB\u52A0\u8D26\u6237\u6216\u8BA2\u9605");
  }) }, calendars ? "\u5237\u65B0\u65E5\u5386\u5217\u8868" : "\u8FDE\u63A5\u7CFB\u7EDF\u65E5\u5386")), /* @__PURE__ */ import_react9.default.createElement("div", { className: "mw-document" }, /* @__PURE__ */ import_react9.default.createElement("p", { className: "small muted" }, "\u8BFB\u53D6\u6240\u9009\u65E5\u5386\u672A\u6765 30 \u5929\u7684\u5B9A\u65F6\u65E5\u7A0B\uFF0C\u6BCF 10 \u5206\u949F\u66F4\u65B0\u3002\u4E0D\u4FEE\u6539\u539F\u65E5\u5386\u3002\u98DE\u4E66\u3001\u817E\u8BAF\u4F1A\u8BAE\u7684\u5B89\u6392\u9700\u5148\u540C\u6B65\u5230\u7CFB\u7EDF\u65E5\u5386\uFF1B\u5E73\u53F0\u8D26\u53F7\u76F4\u8FDE\u5C1A\u672A\u914D\u7F6E\u3002"), calendars && /* @__PURE__ */ import_react9.default.createElement(import_react9.default.Fragment, null, /* @__PURE__ */ import_react9.default.createElement("div", { className: "mw-calendar-list" }, calendars.map((c) => /* @__PURE__ */ import_react9.default.createElement("label", { key: c.id }, /* @__PURE__ */ import_react9.default.createElement("input", { type: "checkbox", "aria-label": `\u540C\u6B65\u65E5\u5386 ${c.title}`, checked: ids.includes(c.id), onChange: (e) => setIds((previous) => e.target.checked ? [...previous, c.id] : previous.filter((id) => id !== c.id)) }), /* @__PURE__ */ import_react9.default.createElement("span", null, c.title, /* @__PURE__ */ import_react9.default.createElement("small", null, c.account))))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react9.default.createElement("select", { "aria-label": "\u65E5\u5386\u4F1A\u8BAE\u9ED8\u8BA4\u9879\u76EE", value: project, onChange: (e) => setProject(e.target.value) }, data.projects.map((p) => /* @__PURE__ */ import_react9.default.createElement("option", { key: p.id, value: p.id }, p.name))), /* @__PURE__ */ import_react9.default.createElement("button", { className: "primary", disabled: busy || !ids.length, onClick: () => run(async () => {
    const value = await api2("/calendar/sync", { enabled: true, ids, project });
    await refresh();
    setResult(`\u540C\u6B65\u5B8C\u6210\uFF1A\u65B0\u589E ${value.added} \u573A\uFF0C\u66F4\u65B0 ${value.updated} \u573A\u4F1A\u8BAE`);
  }) }, "\u540C\u6B65\u5230\u4F1A\u8BAE\u5B89\u6392"))), data.calendarConfig?.enabled && /* @__PURE__ */ import_react9.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react9.default.createElement("p", { className: "small muted" }, "\u6700\u8FD1\u540C\u6B65\uFF1A", new Date(data.calendarConfig.lastSync).toLocaleString()), /* @__PURE__ */ import_react9.default.createElement("button", { disabled: busy, onClick: () => run(() => commit((d) => {
    d.calendarConfig.enabled = false;
  })) }, "\u505C\u6B62\u81EA\u52A8\u540C\u6B65")), (result || data.calendarConfig?.lastError) && /* @__PURE__ */ import_react9.default.createElement("p", { role: "status", className: "small" }, result || data.calendarConfig.lastError)));
}

// src/client/meeting-preparation.jsx
function MeetingPreparation({ data, busy, recording, commit, run, start, api: api2, refresh, createRequested, onCreateOpened, onDeleted }) {
  const [draft, setDraft] = (0, import_react10.useState)(null), [showAll, setShowAll] = (0, import_react10.useState)(false);
  const plans = (data.plans || []).filter((p) => !p.deletedAt && (showAll || ["\u5DF2\u5B89\u6392", "\u63D0\u9192\u4E2D", "\u5F85\u786E\u8BA4"].includes(p.status))).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const open = (p) => setDraft(p ? { ...p } : {});
  (0, import_react10.useEffect)(() => {
    if (createRequested) {
      open();
      onCreateOpened?.();
    }
  }, [createRequested]);
  const change = (original, fn) => run(() => commit((d) => {
    const p = d.plans.find((p2) => p2.id === original.id);
    if (!p || p.deletedAt || planVersion(p) !== planVersion(original)) throw Error("\u4F1A\u8BAE\u5B89\u6392\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u91CD\u65B0\u67E5\u770B");
    fn(p);
  }));
  return /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, null, /* @__PURE__ */ import_react10.default.createElement("section", { className: "mw-heading" }, /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("h1", null, "\u4F1A\u8BAE\u5B89\u6392"), /* @__PURE__ */ import_react10.default.createElement("p", null, "\u5B89\u6392\u4F1A\u8BAE\u3001\u51C6\u5907\u8BAE\u9898\uFF0C\u5230\u65F6\u95F4\u786E\u8BA4\u662F\u5426\u5F00\u59CB\u8BB0\u5F55\u3002\u63D0\u9192\u9700\u8981 DSH \u4FDD\u6301\u8FD0\u884C\u3002")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react10.default.createElement("button", { disabled: busy, onClick: () => setDraft({ fromInvitation: true }) }, "\u7C98\u8D34\u4F1A\u8BAE\u9080\u8BF7"), /* @__PURE__ */ import_react10.default.createElement("button", { className: "primary", disabled: busy, onClick: () => open() }, "\u6DFB\u52A0\u4F1A\u8BAE\u5B89\u6392"))), /* @__PURE__ */ import_react10.default.createElement(CalendarPanel, { data, busy, run, commit, api: api2, refresh }), /* @__PURE__ */ import_react10.default.createElement("div", { className: "mw-filter-row" }, /* @__PURE__ */ import_react10.default.createElement("label", { className: "mw-plan-filter" }, /* @__PURE__ */ import_react10.default.createElement("input", { type: "checkbox", checked: showAll, onChange: (e) => setShowAll(e.target.checked) }), "\u663E\u793A\u5DF2\u5904\u7406\u5B89\u6392")), /* @__PURE__ */ import_react10.default.createElement("section", { className: "mw-card" }, plans.map((p) => /* @__PURE__ */ import_react10.default.createElement("article", { className: "mw-plan", key: p.id }, /* @__PURE__ */ import_react10.default.createElement("header", null, /* @__PURE__ */ import_react10.default.createElement("h2", null, p.title), /* @__PURE__ */ import_react10.default.createElement("span", { className: "badge" }, p.status)), /* @__PURE__ */ import_react10.default.createElement("p", { className: "mw-plan-time" }, new Date(p.startsAt).toLocaleString("zh-CN", { month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }), " \xB7 ", data.projects.find((x) => x.id === p.project)?.name || "\u672A\u5206\u7C7B"), p.agenda && /* @__PURE__ */ import_react10.default.createElement("p", { className: "mw-plan-agenda" }, p.agenda), p.link && /^https?:\/\//i.test(p.link) && /* @__PURE__ */ import_react10.default.createElement("a", { className: "mw-plan-link", href: p.link, target: "_blank", rel: "noreferrer" }, "\u6253\u5F00\u4F1A\u8BAE\u94FE\u63A5 \u2197"), p.lastError && /* @__PURE__ */ import_react10.default.createElement("p", { role: "alert", className: "mw-capture-warning" }, p.lastError), /* @__PURE__ */ import_react10.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react10.default.createElement("button", { className: "primary", disabled: busy || recording || p.status === "\u5DF2\u5F00\u59CB", onClick: () => start(p.id) }, "\u5F00\u59CB\u8BB0\u5F55"), /* @__PURE__ */ import_react10.default.createElement("button", { disabled: busy, onClick: () => open(p), "aria-label": "\u7BA1\u7406\u4F1A\u8BAE\u5B89\u6392\uFF1A" + p.title }, "\u7BA1\u7406"), ["\u63D0\u9192\u4E2D", "\u5F85\u786E\u8BA4"].includes(p.status) && /* @__PURE__ */ import_react10.default.createElement("button", { disabled: busy, onClick: () => change(p, (x) => {
    x.remindAt = new Date(Date.now() + 5 * 6e4).toISOString();
    x.status = "\u5DF2\u5B89\u6392";
  }) }, "5 \u5206\u949F\u540E\u63D0\u9192"), p.status !== "\u5DF2\u53D6\u6D88" && p.status !== "\u5DF2\u5F00\u59CB" && /* @__PURE__ */ import_react10.default.createElement("button", { disabled: busy, onClick: () => change(p, (x) => x.status = "\u5DF2\u53D6\u6D88") }, "\u53D6\u6D88\u5B89\u6392")))), !plans.length && /* @__PURE__ */ import_react10.default.createElement("div", { className: "empty" }, "\u6682\u65E0\u5F85\u53C2\u52A0\u7684\u4F1A\u8BAE\u3002\u6DFB\u52A0\u4F1A\u8BAE\u5B89\u6392\u540E\uFF0C\u5C06\u5728\u7EA6\u5B9A\u65F6\u95F4\u63D0\u9192\u3002")), draft && /* @__PURE__ */ import_react10.default.createElement(MeetingPlanEditor, { key: draft.id || (draft.fromInvitation ? "invitation" : "new"), plan: draft.id ? draft : null, fromInvitation: draft.fromInvitation, data, commit, onClose: () => setDraft(null), onDeleted }));
}

// src/client/assistant-panel.jsx
var import_react13 = __toESM(require("react"), 1);

// src/client/assistant-page.jsx
var import_react12 = __toESM(require("react"), 1);

// src/client/assistant-voice.jsx
var import_react11 = __toESM(require("react"), 1);

// src/client/assistant-page.jsx
var API2 = "/api/meeting-workspace";
async function api(path, body, signal) {
  const response = await fetch(API2 + path, { cache: "no-store", signal, ...body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {} });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || "\u4F1A\u8BAE\u52A9\u624B\u8BF7\u6C42\u5931\u8D25");
  return result;
}
function RangePicker({ data, value, onChange, disabled }) {
  const anchor = (0, import_react12.useRef)(null), [open, setOpen] = (0, import_react12.useState)(false), [query, setQuery] = (0, import_react12.useState)("");
  let selection;
  try {
    selection = selectedMeetings(data, value).scope;
  } catch {
    selection = { label: "\u8303\u56F4\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9", count: 0 };
  }
  const matches = (s) => s.toLowerCase().includes(query.trim().toLowerCase());
  return /* @__PURE__ */ import_react12.default.createElement(import_react12.default.Fragment, null, /* @__PURE__ */ import_react12.default.createElement("button", { ref: anchor, type: "button", className: "mw-assistant-scope mw-scope-trigger", "aria-label": "\u9009\u62E9\u4F1A\u8BAE\u8303\u56F4", "aria-haspopup": "dialog", "aria-expanded": open, disabled, onClick: () => {
    setQuery("");
    setOpen(!open);
  } }, /* @__PURE__ */ import_react12.default.createElement("span", null, selection.label, " \xB7 ", selection.count, " \u573A"), /* @__PURE__ */ import_react12.default.createElement("span", null, "\u2304")), open && /* @__PURE__ */ import_react12.default.createElement(AnchoredPopover, { anchor, label: "\u9009\u62E9\u4F1A\u8BAE\u8303\u56F4", onClose: () => setOpen(false) }, /* @__PURE__ */ import_react12.default.createElement("header", null, /* @__PURE__ */ import_react12.default.createElement("strong", null, "\u4F1A\u8BAE\u8303\u56F4"), /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", className: "link", "aria-label": "\u5173\u95ED\u8303\u56F4\u9009\u62E9", onClick: () => setOpen(false) }, "\xD7")), /* @__PURE__ */ import_react12.default.createElement("input", { autoFocus: true, "aria-label": "\u641C\u7D22\u9879\u76EE\u6216\u4F1A\u8BAE", placeholder: "\u641C\u7D22\u9879\u76EE\u6216\u4F1A\u8BAE", value: query, onChange: (e) => setQuery(e.target.value) }), /* @__PURE__ */ import_react12.default.createElement("div", { className: "mw-range-options" }, /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", className: value.kind === "all" ? "active" : "", onClick: async () => {
    if (await onChange({ kind: "all" })) setOpen(false);
  } }, "\u5168\u90E8\u4F1A\u8BAE ", /* @__PURE__ */ import_react12.default.createElement("small", null, data.meetings.length, " \u573A")), /* @__PURE__ */ import_react12.default.createElement("h3", null, "\u6309\u9879\u76EE"), data.projects.filter((p) => matches(p.name)).map((p) => /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", key: p.id, className: scopeKey(value) === "project:" + p.id ? "active" : "", onClick: async () => {
    if (await onChange({ kind: "project", id: p.id })) setOpen(false);
  } }, /* @__PURE__ */ import_react12.default.createElement("span", null, p.name), /* @__PURE__ */ import_react12.default.createElement("small", null, data.meetings.filter((m) => m.project === p.id).length, " \u573A"))), /* @__PURE__ */ import_react12.default.createElement("h3", null, "\u6309\u4F1A\u8BAE"), data.meetings.filter((m) => matches(m.title)).map((m) => /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", key: m.id, className: scopeKey(value) === "meeting:" + m.id ? "active" : "", onClick: async () => {
    if (await onChange({ kind: "meeting", id: m.id })) setOpen(false);
  } }, /* @__PURE__ */ import_react12.default.createElement("span", null, m.title), /* @__PURE__ */ import_react12.default.createElement("small", null, m.date))), !data.meetings.length && /* @__PURE__ */ import_react12.default.createElement("p", { className: "muted small" }, "\u5C1A\u65E0\u4F1A\u8BAE\u8BB0\u5F55"))));
}
function HistoryPicker({ sessionId, onSelect, disabled }) {
  const anchor = (0, import_react12.useRef)(null), [open, setOpen] = (0, import_react12.useState)(false), [items, setItems] = (0, import_react12.useState)([]), [error, setError] = (0, import_react12.useState)(""), [loading, setLoading] = (0, import_react12.useState)(false), [query, setQuery] = (0, import_react12.useState)("");
  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      setItems((await api("/assistant/history")).items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ import_react12.default.createElement(import_react12.default.Fragment, null, /* @__PURE__ */ import_react12.default.createElement("button", { ref: anchor, type: "button", "aria-label": "\u5386\u53F2\u5BF9\u8BDD", "aria-haspopup": "dialog", "aria-expanded": open, disabled, onClick: toggle }, "\u5386\u53F2\u5BF9\u8BDD"), open && /* @__PURE__ */ import_react12.default.createElement(AnchoredPopover, { anchor, label: "\u5386\u53F2\u5BF9\u8BDD", onClose: () => setOpen(false) }, /* @__PURE__ */ import_react12.default.createElement("header", null, /* @__PURE__ */ import_react12.default.createElement("strong", null, "\u5386\u53F2\u5BF9\u8BDD"), /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", className: "link", "aria-label": "\u5173\u95ED\u5386\u53F2\u5BF9\u8BDD", onClick: () => setOpen(false) }, "\xD7")), /* @__PURE__ */ import_react12.default.createElement("input", { "aria-label": "\u641C\u7D22\u5386\u53F2\u5BF9\u8BDD", placeholder: "\u641C\u7D22\u5BF9\u8BDD\u540D\u79F0", value: query, onChange: (e) => setQuery(e.target.value) }), /* @__PURE__ */ import_react12.default.createElement("div", { className: "mw-range-options" }, items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())).map((i) => /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", key: i.id, className: i.id === sessionId ? "active" : "", onClick: async () => {
    if (await onSelect(i)) setOpen(false);
  } }, /* @__PURE__ */ import_react12.default.createElement("span", null, i.title), /* @__PURE__ */ import_react12.default.createElement("small", null, i.scope.kind === "all" ? "\u5168\u90E8\u4F1A\u8BAE" : i.scope.kind === "project" ? "\u9879\u76EE" : "\u5355\u573A")))), loading && /* @__PURE__ */ import_react12.default.createElement("p", { role: "status", className: "small muted" }, "\u6B63\u5728\u8BFB\u53D6\u5386\u53F2\u5BF9\u8BDD\u2026"), error && /* @__PURE__ */ import_react12.default.createElement("p", { role: "alert", className: "mw-inline-error" }, error), !loading && !error && !items.length && /* @__PURE__ */ import_react12.default.createElement("p", { className: "small muted" }, "\u6682\u65E0\u5386\u53F2\u5BF9\u8BDD")));
}

// src/client/assistant-panel.jsx
function AssistantPanel({
  open,
  onClose,
  data,
  scope,
  sessionId,
  opening,
  ready,
  available,
  conversation,
  onScope,
  onHistory,
  onNew,
  onChooseLocation,
  sources,
  onSource
}) {
  const canChat = ready && available;
  return /* @__PURE__ */ import_react13.default.createElement("aside", { id: "mw-meeting-assistant-panel", className: "mw-assistant-dock mw-assistant-unified", "aria-labelledby": "mw-assistant-dock-title", hidden: !open }, /* @__PURE__ */ import_react13.default.createElement("header", { className: "mw-assistant-dock-title" }, /* @__PURE__ */ import_react13.default.createElement("h2", { id: "mw-assistant-dock-title" }, "\u4F1A\u8BAE\u52A9\u624B"), /* @__PURE__ */ import_react13.default.createElement("button", { type: "button", onClick: onClose, "aria-label": "\u6536\u8D77\u4F1A\u8BAE\u52A9\u624B" }, "\u2212")), canChat && /* @__PURE__ */ import_react13.default.createElement("div", { className: "mw-assistant-dock-controls" }, /* @__PURE__ */ import_react13.default.createElement(RangePicker, { data, value: scope, onChange: onScope, disabled: opening }), /* @__PURE__ */ import_react13.default.createElement(HistoryPicker, { sessionId, onSelect: onHistory, disabled: opening }), /* @__PURE__ */ import_react13.default.createElement("button", { type: "button", disabled: opening, onClick: onNew }, "\u65B0\u5EFA\u5BF9\u8BDD")), /* @__PURE__ */ import_react13.default.createElement("div", { className: "mw-assistant-dock-thread mw-host-conversation", hidden: !canChat || !sessionId || opening }, conversation), (!canChat || !sessionId || opening) && /* @__PURE__ */ import_react13.default.createElement("div", { className: "mw-assistant-dock-empty" }, opening ? /* @__PURE__ */ import_react13.default.createElement("p", { role: "status" }, "\u6B63\u5728\u6253\u5F00\u4F1A\u8BAE\u52A9\u624B\u5BF9\u8BDD\u2026") : !ready ? /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, /* @__PURE__ */ import_react13.default.createElement("p", null, "\u9009\u62E9\u4F1A\u8BAE\u8D44\u6599\u4F4D\u7F6E\u540E\uFF0C\u5373\u53EF\u7528\u4F1A\u8BAE\u52A9\u624B\u67E5\u8BE2\u8BB0\u5F55\u3002"), /* @__PURE__ */ import_react13.default.createElement("button", { type: "button", onClick: onChooseLocation }, "\u9009\u62E9\u8D44\u6599\u6587\u4EF6\u5939")) : available ? /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, /* @__PURE__ */ import_react13.default.createElement("p", null, "\u5F00\u59CB\u4E00\u573A\u5BF9\u8BDD\uFF0C\u67E5\u8BE2\u4F1A\u8BAE\u5185\u5BB9\u3001\u539F\u6587\u548C\u5F85\u529E\u3002"), /* @__PURE__ */ import_react13.default.createElement("button", { className: "primary", type: "button", onClick: onNew }, "\u5F00\u59CB\u5BF9\u8BDD")) : /* @__PURE__ */ import_react13.default.createElement("p", { role: "status" }, "\u4F1A\u8BAE\u52A9\u624B\u670D\u52A1\u6682\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002")), canChat && sessionId && !opening && sources.length > 0 && /* @__PURE__ */ import_react13.default.createElement("footer", { className: "mw-assistant-dock-footer" }, /* @__PURE__ */ import_react13.default.createElement("details", { className: "mw-assistant-dock-sources" }, /* @__PURE__ */ import_react13.default.createElement("summary", null, "\u4F1A\u8BAE\u6765\u6E90 \xB7 ", sources.length), /* @__PURE__ */ import_react13.default.createElement("ul", null, sources.map((source, index) => /* @__PURE__ */ import_react13.default.createElement("li", { key: source.meetingId + ":" + index }, /* @__PURE__ */ import_react13.default.createElement("button", { type: "button", className: "link", onClick: () => onSource(source) }, source.meetingTitle, source.time ? " \xB7 " + source.time : "")))))));
}

// src/client/dashboard.jsx
var import_react14 = __toESM(require("react"), 1);

// src/dashboard.mjs
function dashboardItems(data, project = "") {
  const pendingPlans = (data.plans || []).filter((p) => !p.deletedAt && ["\u5DF2\u5B89\u6392", "\u63D0\u9192\u4E2D", "\u5F85\u786E\u8BA4"].includes(p.status) && (!project || p.project === project)).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const pendingTasks = allTasks(data).filter((t) => !t.done && (!project || t.project === project)).sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999") || a.title.localeCompare(b.title));
  return { plans: pendingPlans, planCount: pendingPlans.length, tasks: pendingTasks, taskCount: pendingTasks.length };
}

// src/client/dashboard.jsx
function AgendaTime({ value }) {
  const date = new Date(value);
  return /* @__PURE__ */ import_react14.default.createElement("time", { dateTime: value, className: "mw-agenda-time" }, /* @__PURE__ */ import_react14.default.createElement("strong", null, date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })), /* @__PURE__ */ import_react14.default.createElement("span", null, date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", weekday: "short" })));
}
function Dashboard({ data, project, today: today2, busy, recording, onPlans, onAddPlan, onStart, onManagePlan, onTasks, onAddTask, onToggleTask, onMeeting }) {
  const { plans, planCount, tasks, taskCount } = dashboardItems(data, project);
  return /* @__PURE__ */ import_react14.default.createElement("section", { className: "mw-dashboard", "aria-label": "\u4F1A\u8BAE\u5B89\u6392\u4E0E\u5F85\u529E" }, /* @__PURE__ */ import_react14.default.createElement("section", { className: "mw-card mw-overview-card" }, /* @__PURE__ */ import_react14.default.createElement("header", null, /* @__PURE__ */ import_react14.default.createElement("h2", null, "\u4F1A\u8BAE\u5B89\u6392 ", /* @__PURE__ */ import_react14.default.createElement("small", null, planCount)), /* @__PURE__ */ import_react14.default.createElement("button", { className: "link", onClick: onPlans }, "\u67E5\u770B\u5168\u90E8")), /* @__PURE__ */ import_react14.default.createElement("div", { className: "mw-overview-list" }, plans.map((p) => {
    const waiting = ["\u63D0\u9192\u4E2D", "\u5F85\u786E\u8BA4"].includes(p.status);
    return /* @__PURE__ */ import_react14.default.createElement("article", { className: "mw-overview-plan", key: p.id }, /* @__PURE__ */ import_react14.default.createElement(AgendaTime, { value: p.startsAt }), /* @__PURE__ */ import_react14.default.createElement("div", { className: "mw-agenda-entry" }, /* @__PURE__ */ import_react14.default.createElement("strong", null, p.title), /* @__PURE__ */ import_react14.default.createElement("div", { className: "mw-agenda-entry-actions" }, /* @__PURE__ */ import_react14.default.createElement("span", { className: "badge" + (waiting ? " mw-state-pending" : "") }, waiting ? "\u5F85\u786E\u8BA4" : Date.parse(p.startsAt) <= Date.now() ? "\u5F85\u5F00\u59CB" : "\u5DF2\u5B89\u6392"), /* @__PURE__ */ import_react14.default.createElement("button", { className: "link", disabled: busy, "aria-label": "\u7BA1\u7406\u4F1A\u8BAE\u5B89\u6392 " + p.title, onClick: () => onManagePlan(p.id) }, "\u7BA1\u7406"), /* @__PURE__ */ import_react14.default.createElement("button", { className: "link", disabled: busy || recording, onClick: () => onStart(p.id) }, "\u5F00\u59CB\u8BB0\u5F55"))));
  }), !plans.length && /* @__PURE__ */ import_react14.default.createElement("p", { className: "mw-overview-empty" }, "\u6682\u65E0\u5F85\u53C2\u52A0\u7684\u4F1A\u8BAE")), /* @__PURE__ */ import_react14.default.createElement("footer", null, /* @__PURE__ */ import_react14.default.createElement("button", { onClick: onAddPlan }, "\uFF0B \u6DFB\u52A0\u4F1A\u8BAE\u5B89\u6392"))), /* @__PURE__ */ import_react14.default.createElement("section", { className: "mw-card mw-overview-card" }, /* @__PURE__ */ import_react14.default.createElement("header", null, /* @__PURE__ */ import_react14.default.createElement("h2", null, "\u4EFB\u52A1\u5B89\u6392 ", /* @__PURE__ */ import_react14.default.createElement("small", null, taskCount)), /* @__PURE__ */ import_react14.default.createElement("button", { className: "link", onClick: onTasks }, "\u67E5\u770B\u5168\u90E8")), /* @__PURE__ */ import_react14.default.createElement("div", { className: "mw-overview-list" }, tasks.map((t) => {
    const overdue = t.due && t.due < today2;
    return /* @__PURE__ */ import_react14.default.createElement("article", { className: "mw-overview-task", key: t.id }, /* @__PURE__ */ import_react14.default.createElement("label", null, /* @__PURE__ */ import_react14.default.createElement("input", { type: "checkbox", "aria-label": "\u5B8C\u6210 " + t.title, checked: false, disabled: busy, onChange: () => onToggleTask(t) }), /* @__PURE__ */ import_react14.default.createElement("strong", null, t.title)), /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("span", { className: overdue ? "overdue" : "" }, t.owner || "\u672A\u5206\u914D", t.due && "\u3000" + t.due, overdue ? "\u3000\u5DF2\u903E\u671F" : ""), /* @__PURE__ */ import_react14.default.createElement("button", { className: "link", onClick: () => onMeeting(t.meetingId) }, t.meetingTitle)));
  }), !tasks.length && /* @__PURE__ */ import_react14.default.createElement("p", { className: "mw-overview-empty" }, "\u6682\u65E0\u5F85\u8DDF\u8FDB\u4EFB\u52A1")), /* @__PURE__ */ import_react14.default.createElement("footer", null, /* @__PURE__ */ import_react14.default.createElement("button", { onClick: onAddTask }, "\uFF0B \u65B0\u5EFA\u4EFB\u52A1"))));
}

// src/client/meeting-detection-settings.jsx
var import_react15 = __toESM(require("react"), 1);
function MeetingDetectionSettings({ api: api2, ready, projects, status, onSaved }) {
  const [busy, setBusy] = (0, import_react15.useState)(false), [error, setError] = (0, import_react15.useState)(""), [local, setLocal] = (0, import_react15.useState)(null);
  const value = local || status || { enabled: true, project: "default" };
  (0, import_react15.useEffect)(() => setLocal(null), [status]);
  async function save(change) {
    setBusy(true);
    setError("");
    try {
      setLocal(await api2("/detection", { enabled: value.enabled, project: value.project || "default", offlineEnabled: value.offlineEnabled === true, ...change }));
      await onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function check() {
    setBusy(true);
    setError("");
    try {
      setLocal(await api2("/detection/check", {}));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ import_react15.default.createElement("section", { className: "mw-setting mw-detection", "aria-label": "\u4F1A\u8BAE\u68C0\u6D4B\u4E0E\u60AC\u6D6E\u8F6C\u5199" }, /* @__PURE__ */ import_react15.default.createElement("h3", null, "\u4F1A\u8BAE\u68C0\u6D4B\u4E0E\u60AC\u6D6E\u8F6C\u5199"), /* @__PURE__ */ import_react15.default.createElement("label", { className: "inline" }, /* @__PURE__ */ import_react15.default.createElement("input", { type: "checkbox", "aria-label": "\u68C0\u6D4B\u4F1A\u8BAE\u5E76\u63D0\u9192", checked: value.enabled !== false, disabled: busy || !ready, onChange: (e) => save({ enabled: e.target.checked }) }), "\u68C0\u6D4B\u4F1A\u8BAE\u5E76\u63D0\u9192"), /* @__PURE__ */ import_react15.default.createElement("label", { className: "inline" }, /* @__PURE__ */ import_react15.default.createElement("input", { type: "checkbox", "aria-label": "\u7EBF\u4E0B\u4F1A\u8BAE\u63D0\u9192", checked: value.offlineEnabled === true, disabled: busy || !ready, onChange: (e) => save({ offlineEnabled: e.target.checked }) }), "\u7EBF\u4E0B\u4F1A\u8BAE\u63D0\u9192"), /* @__PURE__ */ import_react15.default.createElement("p", { className: "small muted" }, "\u9ED8\u8BA4\u5173\u95ED\u3002\u5F00\u542F\u540E\u6301\u7EED\u4F7F\u7528\u9EA6\u514B\u98CE\uFF0C\u5728\u672C\u673A\u5224\u65AD\u6301\u7EED\u4EBA\u58F0\uFF0C\u7EA6\u534A\u5206\u949F\u540E\u63D0\u9192\uFF1B\u786E\u8BA4\u524D\u4E0D\u4FDD\u5B58\u3001\u4E0D\u8F6C\u5199\u3001\u4E0D\u4E0A\u4F20\u3002\u666E\u901A\u804A\u5929\u6216\u5916\u653E\u4EBA\u58F0\u4E5F\u53EF\u80FD\u89E6\u53D1\u3002"), value.offlineEnabled && /* @__PURE__ */ import_react15.default.createElement("p", { className: "small" }, { off: "\u5DF2\u5173\u95ED", starting: "\u6B63\u5728\u8BF7\u6C42\u9EA6\u514B\u98CE\u2026", listening: "\u6B63\u5728\u68C0\u6D4B\u4EBA\u58F0 \xB7 \u9EA6\u514B\u98CE\u4F7F\u7528\u4E2D", paused: "\u5F55\u97F3\u4E2D\uFF0C\u68C0\u6D4B\u5DF2\u6682\u505C", "permission-required": "\u9700\u8981\u9EA6\u514B\u98CE\u6743\u9650", failed: "\u68C0\u6D4B\u672A\u8FD0\u884C" }[value.offline?.phase] || "\u51C6\u5907\u68C0\u6D4B", value.offline?.error ? " \xB7 " + value.offline.error : ""), /* @__PURE__ */ import_react15.default.createElement("p", { className: "small muted" }, "\u8BC6\u522B\u817E\u8BAF\u4F1A\u8BAE\u3001\u98DE\u4E66\u6B63\u5728\u4F7F\u7528\u9EA6\u514B\u98CE\u7684\u72B6\u6001\uFF0C\u786E\u8BA4\u540E\u624D\u5F00\u59CB\u5F55\u97F3\u548C\u5B9E\u65F6\u8F6C\u5199\u3002\u540C\u4E00\u573A\u4F1A\u8BAE\u5FFD\u7565\u540E\u4E0D\u91CD\u590D\u63D0\u9192\uFF0C\u4E5F\u53EF\u5EF6\u540E 5 \u5206\u949F\u3002"), /* @__PURE__ */ import_react15.default.createElement("label", { className: "mw-retention" }, "\u5F55\u97F3\u9ED8\u8BA4\u9879\u76EE", /* @__PURE__ */ import_react15.default.createElement("select", { "aria-label": "\u68C0\u6D4B\u4F1A\u8BAE\u7684\u9ED8\u8BA4\u9879\u76EE", value: value.project || "default", disabled: busy || !ready, onChange: (e) => save({ project: e.target.value }) }, projects.map((p) => /* @__PURE__ */ import_react15.default.createElement("option", { key: p.id, value: p.id }, p.name)))), /* @__PURE__ */ import_react15.default.createElement("div", { className: "mw-detection-status" }, /* @__PURE__ */ import_react15.default.createElement("span", { className: "badge" }, !ready ? "\u5F85\u9009\u62E9\u8D44\u6599\u4F4D\u7F6E" : value.enabled === false ? "\u5DF2\u5173\u95ED" : value.supported === false ? "\u5F53\u524D\u7CFB\u7EDF\u4E0D\u53EF\u7528" : value.platforms?.length ? "\u53D1\u73B0\u4F1A\u8BAE\u6D3B\u52A8" : value.lastCheckedAt ? "\u68C0\u6D4B\u4E2D" : "\u7B49\u5F85\u68C0\u6D4B"), /* @__PURE__ */ import_react15.default.createElement("button", { type: "button", disabled: busy || !ready || value.enabled === false, onClick: check }, busy ? "\u68C0\u6D4B\u4E2D\u2026" : "\u7ACB\u5373\u68C0\u6D4B")), !!value.platforms?.length && /* @__PURE__ */ import_react15.default.createElement("p", { className: "small" }, value.platforms.map((p) => p.name).join("\u3001"), value.prompting ? " \xB7 \u7B49\u5F85\u786E\u8BA4\u662F\u5426\u8BB0\u5F55" : ""), (error || value.error) && /* @__PURE__ */ import_react15.default.createElement("p", { role: "alert", className: "mw-capture-warning" }, error || value.error), /* @__PURE__ */ import_react15.default.createElement("p", { className: "small muted" }, "\u9700\u8981 macOS 14.2 \u6216\u66F4\u65B0\u7248\u672C\uFF1B\u4E0D\u91C7\u96C6\u4F1A\u8BAE\u58F0\u97F3\u6765\u505A\u68C0\u6D4B\u3002\u53EA\u6536\u542C\u4E14\u5E94\u7528\u672A\u542F\u7528\u9EA6\u514B\u98CE\u65F6\u53EF\u80FD\u6F0F\u68C0\uFF0C\u53EF\u624B\u52A8\u5F00\u59CB\u8BB0\u5F55\u3002"), /* @__PURE__ */ import_react15.default.createElement("div", { className: "mw-floating-explanation" }, /* @__PURE__ */ import_react15.default.createElement("b", null, "\u5F55\u97F3\u60AC\u6D6E\u7A97"), /* @__PURE__ */ import_react15.default.createElement("p", null, "\u5F00\u59CB\u5F55\u97F3\u540E\u663E\u793A\u5C0F\u60AC\u6D6E\u5165\u53E3\uFF0C\u70B9\u51FB\u5C55\u5F00\u5B9E\u65F6\u9010\u5B57\u7A3F\u4E0E AI \u6458\u8981\uFF0C\u6536\u8D77\u540E\u56DE\u5230\u5165\u53E3\u3002\u5DE5\u4F5C\u53F0\u6700\u5C0F\u5316\u540E\u7EE7\u7EED\u4FDD\u7559\uFF0C\u53EF\u5728\u5C0F\u7A97\u5185\u6682\u505C\u3001\u7EE7\u7EED\u548C\u7ED3\u675F\uFF1B\u9690\u85CF\u540E\u53EF\u4ECE\u83DC\u5355\u680F\u300CDSH \u5F55\u97F3 \u2192 \u663E\u793A\u5B9E\u65F6\u8F6C\u5199\u300D\u6062\u590D\u3002")));
}

// src/client/storage-management.jsx
var import_react16 = __toESM(require("react"), 1);
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024, index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return value.toFixed(value < 10 ? 1 : 0) + " " + units[index];
}
function StorageManagement({ api: api2, onSaved, ready, recording, location }) {
  const [state, setState] = (0, import_react16.useState)(null), [loading, setLoading] = (0, import_react16.useState)(false), [error, setError] = (0, import_react16.useState)(""), [notice, setNotice] = (0, import_react16.useState)(""), [picked, setPicked] = (0, import_react16.useState)([]), [preview, setPreview] = (0, import_react16.useState)(null), [query, setQuery] = (0, import_react16.useState)(""), [onlyExpired, setOnlyExpired] = (0, import_react16.useState)(false);
  const run = async (operation) => {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await operation();
    } catch (e) {
      setError(e.message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };
  const load = async () => {
    const next = await api2("/storage");
    setState(next);
    setPicked((ids) => ids.filter((id) => next.rows.some((row) => row.id === id && row.canClean)));
    return next;
  };
  (0, import_react16.useEffect)(() => {
    setState(null);
    setPreview(null);
    setPicked([]);
    if (ready) run(load);
  }, [ready, location]);
  const save = async (path, payload) => {
    const next = await api2(path, payload);
    setState(next);
    setPreview(null);
    setPicked([]);
    await onSaved();
  };
  const rows = state?.rows.filter((m) => (m.files || m.missing) && (!onlyExpired || m.expired) && (!query || m.title.toLowerCase().includes(query.toLowerCase()))) || [];
  const eligible = rows.filter((m) => m.canClean), selected = eligible.filter((m) => picked.includes(m.id));
  const prepare = (ids) => run(async () => setPreview(await api2("/storage/preview", { ids })));
  return /* @__PURE__ */ import_react16.default.createElement("section", { className: "mw-setting mw-storage", "aria-label": "\u5B58\u50A8\u7BA1\u7406" }, /* @__PURE__ */ import_react16.default.createElement("div", { className: "mw-storage-heading" }, /* @__PURE__ */ import_react16.default.createElement("h3", null, "\u5B58\u50A8\u7BA1\u7406"), /* @__PURE__ */ import_react16.default.createElement("button", { type: "button", disabled: loading || !ready, onClick: () => run(async () => {
    setPreview(null);
    await load();
  }) }, "\u5237\u65B0\u5360\u7528")), !ready ? /* @__PURE__ */ import_react16.default.createElement("p", { className: "muted" }, "\u9009\u62E9\u8D44\u6599\u6587\u4EF6\u5939\u540E\u53EF\u7BA1\u7406\u5F55\u97F3\u3002") : !state && !error ? /* @__PURE__ */ import_react16.default.createElement("p", { className: "muted" }, "\u6B63\u5728\u7EDF\u8BA1\u5F55\u97F3\u4E0E\u91C7\u96C6\u7F13\u5B58\u2026") : null, error && /* @__PURE__ */ import_react16.default.createElement("p", { role: "alert", className: "mw-capture-warning" }, error), notice && /* @__PURE__ */ import_react16.default.createElement("p", { role: "status", className: "mw-storage-notice" }, notice), state && /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, /* @__PURE__ */ import_react16.default.createElement("div", { className: "mw-storage-stats" }, /* @__PURE__ */ import_react16.default.createElement("div", null, /* @__PURE__ */ import_react16.default.createElement("strong", null, formatBytes(state.totalBytes)), /* @__PURE__ */ import_react16.default.createElement("span", null, "\u5F55\u97F3\u76EE\u5F55\u6587\u4EF6\u5927\u5C0F")), /* @__PURE__ */ import_react16.default.createElement("div", null, /* @__PURE__ */ import_react16.default.createElement("strong", null, state.rows.filter((m) => m.files).length), /* @__PURE__ */ import_react16.default.createElement("span", null, "\u6709\u5F55\u97F3\u7684\u4F1A\u8BAE")), /* @__PURE__ */ import_react16.default.createElement("div", null, /* @__PURE__ */ import_react16.default.createElement("strong", null, state.rows.filter((m) => m.expired && m.canClean).length), /* @__PURE__ */ import_react16.default.createElement("span", null, "\u5DF2\u5230\u4FDD\u7559\u671F\u9650"))), !!state.otherBytes && /* @__PURE__ */ import_react16.default.createElement("p", { className: "small muted" }, "\u542B ", formatBytes(state.otherBytes), " \u672A\u5173\u8054\u5230\u5F53\u524D\u4F1A\u8BAE\u7684\u6587\u4EF6\uFF0C\u6682\u4E0D\u81EA\u52A8\u6E05\u7406\u3002"), state.hasExternalLinks && /* @__PURE__ */ import_react16.default.createElement("p", { className: "small muted" }, "\u76EE\u5F55\u5305\u542B\u5916\u90E8\u6587\u4EF6\u94FE\u63A5\uFF0C\u4E0D\u8DDF\u968F\u94FE\u63A5\u7EDF\u8BA1\u6216\u6E05\u7406\u3002"), /* @__PURE__ */ import_react16.default.createElement("label", { className: "mw-retention" }, "\u5F55\u97F3\u4FDD\u7559\u671F\u9650", /* @__PURE__ */ import_react16.default.createElement("select", { "aria-label": "\u5F55\u97F3\u4FDD\u7559\u671F\u9650", value: state.retentionDays, disabled: loading, onChange: (e) => run(async () => {
    await save("/storage/policy", { retentionDays: Number(e.target.value) });
    setNotice("\u4FDD\u7559\u671F\u9650\u5DF2\u4FDD\u5B58");
  }) }, /* @__PURE__ */ import_react16.default.createElement("option", { value: 0 }, "\u4E0D\u9650\u671F"), [7, 30, 90, 180, 365].map((days) => /* @__PURE__ */ import_react16.default.createElement("option", { key: days, value: days }, days, " \u5929")))), /* @__PURE__ */ import_react16.default.createElement("p", { className: "small muted" }, "\u4ECE\u5F55\u97F3\u6587\u4EF6\u6700\u540E\u4FDD\u5B58\u65F6\u95F4\u8BA1\u7B97\uFF1B\u5230\u671F\u540E\u5217\u4E3A\u5F85\u6E05\u7406\uFF0C\u786E\u8BA4\u540E\u5220\u9664\u3002\u957F\u671F\u4FDD\u7559\u7684\u5F55\u97F3\u4E0D\u53C2\u4E0E\u6E05\u7406\u3002"), /* @__PURE__ */ import_react16.default.createElement("div", { className: "mw-storage-filter" }, /* @__PURE__ */ import_react16.default.createElement("input", { "aria-label": "\u641C\u7D22\u5F55\u97F3\u4F1A\u8BAE", placeholder: "\u641C\u7D22\u4F1A\u8BAE\u540D\u79F0", value: query, onChange: (e) => {
    setQuery(e.target.value);
    setPreview(null);
  } }), /* @__PURE__ */ import_react16.default.createElement("label", { className: "inline" }, /* @__PURE__ */ import_react16.default.createElement("input", { type: "checkbox", checked: onlyExpired, onChange: (e) => {
    setOnlyExpired(e.target.checked);
    setPreview(null);
  } }), "\u4EC5\u770B\u5230\u671F\u5F55\u97F3")), /* @__PURE__ */ import_react16.default.createElement("div", { className: "mw-storage-selection" }, /* @__PURE__ */ import_react16.default.createElement("label", { className: "inline" }, /* @__PURE__ */ import_react16.default.createElement("input", { type: "checkbox", "aria-label": "\u9009\u62E9\u53EF\u6E05\u7406\u5F55\u97F3", checked: !!eligible.length && selected.length === eligible.length, disabled: loading || !!recording || !eligible.length, onChange: () => {
    setPreview(null);
    setPicked(selected.length === eligible.length ? [] : eligible.map((m) => m.id));
  } }), "\u5DF2\u9009 ", selected.length, " \u573A"), /* @__PURE__ */ import_react16.default.createElement("button", { type: "button", className: "danger", disabled: loading || !!recording || !selected.length, onClick: () => prepare(selected.map((m) => m.id)) }, "\u6E05\u7406\u6240\u9009\u5F55\u97F3")), /* @__PURE__ */ import_react16.default.createElement("div", { className: "mw-storage-list" }, rows.map((m) => /* @__PURE__ */ import_react16.default.createElement("article", { key: m.id, className: "mw-storage-row" }, /* @__PURE__ */ import_react16.default.createElement("label", { className: "mw-storage-pick" }, /* @__PURE__ */ import_react16.default.createElement("input", { type: "checkbox", "aria-label": "\u9009\u62E9\u5F55\u97F3 " + m.title, checked: selected.some((x) => x.id === m.id), disabled: loading || !!recording || !m.canClean, onChange: () => {
    setPreview(null);
    setPicked((ids) => ids.includes(m.id) ? ids.filter((id) => id !== m.id) : [...ids, m.id]);
  } }), /* @__PURE__ */ import_react16.default.createElement("span", null, /* @__PURE__ */ import_react16.default.createElement("strong", null, m.title), /* @__PURE__ */ import_react16.default.createElement("small", null, m.date, " \xB7 ", formatBytes(m.bytes), m.cacheBytes ? "\uFF08\u542B\u91C7\u96C6\u7F13\u5B58\uFF09" : "", m.expired ? " \xB7 \u5DF2\u5230\u671F" : "", m.keep ? " \xB7 \u957F\u671F\u4FDD\u7559" : ""), m.reason && m.files > 0 && /* @__PURE__ */ import_react16.default.createElement("small", null, m.reason), m.missing > 0 && /* @__PURE__ */ import_react16.default.createElement("small", null, m.missing, " \u4E2A\u6587\u4EF6\u672A\u627E\u5230"))), /* @__PURE__ */ import_react16.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react16.default.createElement("button", { type: "button", disabled: loading || !m.files, "aria-pressed": m.keep, onClick: () => run(() => save("/storage/keep", { meetingId: m.id, keep: !m.keep })) }, m.keep ? "\u53D6\u6D88\u957F\u671F\u4FDD\u7559" : "\u957F\u671F\u4FDD\u7559"), /* @__PURE__ */ import_react16.default.createElement("button", { type: "button", className: "danger", disabled: loading || !!recording || !m.canClean, onClick: () => prepare([m.id]) }, "\u6E05\u7406")))), !rows.length && /* @__PURE__ */ import_react16.default.createElement("p", { className: "empty" }, onlyExpired ? "\u6CA1\u6709\u5230\u671F\u5F55\u97F3" : "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5F55\u97F3")), preview && /* @__PURE__ */ import_react16.default.createElement("div", { className: "mw-storage-confirm", role: "alertdialog", "aria-label": "\u786E\u8BA4\u6E05\u7406\u5F55\u97F3" }, /* @__PURE__ */ import_react16.default.createElement("h4", null, "\u6E05\u7406 ", preview.rows.length, " \u573A\u4F1A\u8BAE\u7684\u5F55\u97F3"), /* @__PURE__ */ import_react16.default.createElement("p", null, "\u5C06\u6C38\u4E45\u5220\u9664 ", formatBytes(preview.bytes), " \u5F55\u97F3\u53CA\u5173\u8054\u91C7\u96C6\u7F13\u5B58\uFF0C\u65E0\u6CD5\u64A4\u9500\u3002\u4F1A\u8BAE\u7EAA\u8981\u3001\u9010\u5B57\u7A3F\u548C\u4EFB\u52A1\u4F1A\u4FDD\u7559\uFF1B\u6587\u672C\u5907\u4EFD\u4E0D\u5305\u542B\u5F55\u97F3\u3002"), /* @__PURE__ */ import_react16.default.createElement("ul", null, preview.rows.map((m) => /* @__PURE__ */ import_react16.default.createElement("li", { key: m.id }, m.title))), /* @__PURE__ */ import_react16.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react16.default.createElement("button", { type: "button", disabled: loading, onClick: () => setPreview(null) }, "\u53D6\u6D88\u6E05\u7406"), /* @__PURE__ */ import_react16.default.createElement("button", { type: "button", className: "danger", disabled: loading || !!recording, onClick: () => run(async () => {
    const result = await api2("/storage/cleanup", { token: preview.token, confirmed: true });
    setPreview(null);
    setPicked([]);
    setState(result.storage);
    await onSaved();
    setNotice(result.failedFiles ? `\u5DF2\u89E3\u9664 ${result.meetings} \u573A\u5F55\u97F3\u5173\u8054\uFF1B${result.failedFiles} \u4E2A\u6587\u4EF6\u672A\u80FD\u5220\u9664\uFF0C\u4ECD\u8BA1\u5165\u672A\u5173\u8054\u5360\u7528\uFF0C\u8BF7\u68C0\u67E5 audio/.cleanup \u76EE\u5F55\u3002` : `\u5DF2\u6E05\u7406 ${result.meetings} \u573A\u4F1A\u8BAE\u5F55\u97F3\uFF0C\u5220\u9664 ${formatBytes(result.removedBytes)} \u6587\u4EF6\u3002`);
  }) }, loading ? "\u6B63\u5728\u6E05\u7406\u2026" : "\u786E\u8BA4\u6C38\u4E45\u5220\u9664\u5F55\u97F3")))));
}

// src/client/meeting-records.jsx
var import_react17 = __toESM(require("react"), 1);
function Folder() {
  return /* @__PURE__ */ import_react17.default.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ import_react17.default.createElement("path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" }));
}
function MeetingRecords({ data, rows, project, onProject, busy, onManageProjects, onNewProject, onImport, toolbar, renderMeetings }) {
  const counts = new Map(data.projects.map((p) => [p.id, 0]));
  for (const m of data.meetings) counts.set(m.project, (counts.get(m.project) || 0) + 1);
  const groups = data.projects.filter((p) => !project || p.id === project).map((p) => ({ ...p, meetings: rows.filter((m) => m.project === p.id) })).filter((p) => project || p.meetings.length);
  return /* @__PURE__ */ import_react17.default.createElement(import_react17.default.Fragment, null, /* @__PURE__ */ import_react17.default.createElement("section", { className: "mw-heading mw-records-heading" }, /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement("h1", null, "\u4F1A\u8BAE\u8BB0\u5F55"), /* @__PURE__ */ import_react17.default.createElement("p", null, "\u6309\u9879\u76EE\u67E5\u770B\u4F1A\u8BAE\u7EAA\u8981\u3001\u9010\u5B57\u7A3F\u4E0E\u5F55\u97F3\u3002")), /* @__PURE__ */ import_react17.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react17.default.createElement("button", { disabled: busy, onClick: onManageProjects }, "\u9879\u76EE\u7BA1\u7406"), /* @__PURE__ */ import_react17.default.createElement("button", { className: "primary mw-action-icon", disabled: busy, onClick: onImport }, /* @__PURE__ */ import_react17.default.createElement(WorkspaceIcon, { name: "import" }), "\u5BFC\u5165\u4F1A\u8BAE"))), /* @__PURE__ */ import_react17.default.createElement("section", { className: "mw-project-collections", "aria-label": "\u4F1A\u8BAE\u9879\u76EE\u5206\u7C7B" }, /* @__PURE__ */ import_react17.default.createElement("button", { className: "mw-project-folder" + (!project ? " is-active" : ""), "aria-pressed": !project, onClick: () => onProject("") }, /* @__PURE__ */ import_react17.default.createElement(Folder, null), /* @__PURE__ */ import_react17.default.createElement("span", null, /* @__PURE__ */ import_react17.default.createElement("strong", null, "\u5168\u90E8\u4F1A\u8BAE"), /* @__PURE__ */ import_react17.default.createElement("small", { "aria-label": data.meetings.length + " \u573A\u4F1A\u8BAE" }, data.meetings.length))), data.projects.map((p) => /* @__PURE__ */ import_react17.default.createElement("button", { key: p.id, className: "mw-project-folder" + (project === p.id ? " is-active" : ""), "aria-pressed": project === p.id, onClick: () => onProject(p.id) }, /* @__PURE__ */ import_react17.default.createElement(Folder, null), /* @__PURE__ */ import_react17.default.createElement("span", null, /* @__PURE__ */ import_react17.default.createElement("strong", null, p.name), /* @__PURE__ */ import_react17.default.createElement("small", { "aria-label": (counts.get(p.id) || 0) + " \u573A\u4F1A\u8BAE" }, counts.get(p.id) || 0)))), /* @__PURE__ */ import_react17.default.createElement("button", { className: "mw-project-folder mw-project-folder-new", disabled: busy, onClick: onNewProject }, /* @__PURE__ */ import_react17.default.createElement("span", { className: "mw-folder-plus", "aria-hidden": "true" }, "\uFF0B"), /* @__PURE__ */ import_react17.default.createElement("strong", null, "\u65B0\u5EFA\u9879\u76EE"))), /* @__PURE__ */ import_react17.default.createElement("p", { className: "mw-records-count" }, project ? data.projects.find((p) => p.id === project)?.name : "\u5168\u90E8\u9879\u76EE", " \xB7 ", rows.length, " \u573A\u4F1A\u8BAE"), /* @__PURE__ */ import_react17.default.createElement("div", { className: "mw-records-list" }, toolbar, groups.map((group) => /* @__PURE__ */ import_react17.default.createElement("section", { className: "mw-card mw-project-meetings", key: group.id, "aria-label": group.name + "\u7684\u4F1A\u8BAE" }, /* @__PURE__ */ import_react17.default.createElement("header", { className: "mw-card-head" }, /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement(Folder, null), /* @__PURE__ */ import_react17.default.createElement("h2", null, group.name), /* @__PURE__ */ import_react17.default.createElement("small", null, group.meetings.length, " \u573A\u4F1A\u8BAE"))), renderMeetings(group.meetings), !group.meetings.length && /* @__PURE__ */ import_react17.default.createElement("p", { className: "empty" }, counts.get(group.id) ? "\u6CA1\u6709\u7B26\u5408\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u7684\u4F1A\u8BAE\u3002" : "\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u4F1A\u8BAE\u3002\u53EF\u5BFC\u5165\u4F1A\u8BAE\uFF0C\u6216\u5728\u9996\u9875\u5F00\u59CB\u8BB0\u5F55\u3002"))), !groups.length && /* @__PURE__ */ import_react17.default.createElement("section", { className: "mw-card" }, /* @__PURE__ */ import_react17.default.createElement("p", { className: "empty" }, data.meetings.length ? "\u6CA1\u6709\u7B26\u5408\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u7684\u4F1A\u8BAE\u3002" : "\u8FD8\u6CA1\u6709\u4F1A\u8BAE\u8BB0\u5F55\u3002\u5F55\u5236\u6216\u5BFC\u5165\u4F1A\u8BAE\u540E\uFF0C\u4F1A\u6309\u6240\u5C5E\u9879\u76EE\u6536\u7EB3\u3002"))));
}

// src/client/workbench-service.mjs
function workbenchService(ctx) {
  return {
    subscribe: (listener) => ctx.desktopWorkbenches.subscribe(listener),
    getSnapshot: () => ctx.desktopWorkbenches.getSnapshot(),
    subscribeSessions: (listener) => ctx.sessions.list.subscribe(listener),
    currentSession: () => ctx.desktopWorkbenches.currentSession(),
    ownsSession: (id) => ctx.desktopWorkbenches.ownsSession(id),
    ensureSession: (options) => ctx.desktopWorkbenches.ensureSession(options)
  };
}

// src/client/speech-configuration.jsx
var import_react18 = __toESM(require("react"), 1);
var phases = {
  unavailable: "\u4E0D\u53EF\u7528",
  disabled: "\u672A\u542F\u7528",
  unprepared: "\u5C1A\u672A\u521D\u59CB\u5316",
  initializing: "\u521D\u59CB\u5316\u4E2D",
  checking: "\u6B63\u5728\u68C0\u67E5",
  downloading: "\u6B63\u5728\u4E0B\u8F7D",
  loading: "\u6B63\u5728\u52A0\u8F7D",
  waking: "\u6B63\u5728\u5524\u9192",
  standby: "\u5DF2\u5C31\u7EEA",
  ready: "\u5DF2\u5C31\u7EEA",
  failed: "\u521D\u59CB\u5316\u5931\u8D25",
  cancelled: "\u5DF2\u53D6\u6D88",
  cancelling: "\u6B63\u5728\u53D6\u6D88"
};
var modeName = (model) => model.mode === "streaming" ? "\u5B9E\u65F6\u8F6C\u5199" : "\u5206\u6BB5\u8F6C\u5199";
var phaseName = (model) => phases[model.phase] || "\u672A\u5C31\u7EEA";
function RecordingModelInfo({ catalog, busy, prepare }) {
  const model = catalog?.models.find((m) => m.id === catalog.selected);
  if (!model) return /* @__PURE__ */ import_react18.default.createElement("p", { className: "small muted" }, "\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u9009\u62E9\u8BED\u97F3\u8F6C\u5199\u6A21\u578B\u3002");
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: "mw-setting" }, /* @__PURE__ */ import_react18.default.createElement("p", { className: "small" }, /* @__PURE__ */ import_react18.default.createElement("strong", null, model.label), " \xB7 ", modeName(model), " \xB7 ", phaseName(model)), /* @__PURE__ */ import_react18.default.createElement("p", { className: "small muted" }, model.available ? model.description : "\u5F53\u524D\u73AF\u5883\u65E0\u6CD5\u8FD0\u884C\u6B64\u6A21\u578B\uFF0C\u53EF\u5728\u8BBE\u7F6E\u4E2D\u66F4\u6362\u6A21\u578B\uFF0C\u6216\u53D6\u6D88\u540C\u6B65\u8F6C\u5199\u3002"), model.available && !model.ready && /* @__PURE__ */ import_react18.default.createElement("button", { type: "button", disabled: busy || model.busy, onClick: prepare }, "\u51C6\u5907\u8BED\u97F3\u6A21\u578B"));
}
function SpeechConfiguration({ api: api2, disabled, activeModel, onSaved }) {
  const [state, setState] = (0, import_react18.useState)(null), [error, setError] = (0, import_react18.useState)(""), [busy, setBusy] = (0, import_react18.useState)(false), [restartRequired, setRestartRequired] = (0, import_react18.useState)(false);
  (0, import_react18.useEffect)(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const value = await api2("/asr/models", void 0, { signal: controller.signal });
        if (!controller.signal.aborted) setState(value);
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message);
      }
    };
    void load();
    const timer = setInterval(load, 1800);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [api2]);
  async function update(action, id) {
    setError("");
    setBusy(true);
    try {
      const value = await api2("/asr/models", { action, id });
      if (value.restartRequired) setRestartRequired(true);
      setState(action === "select" ? value : await api2("/asr/models"));
      await onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const selected = state?.models.find((model) => model.id === state.selected);
  const current = state?.models.find((model) => model.id === activeModel);
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: "mw-setting mw-speech-settings" }, /* @__PURE__ */ import_react18.default.createElement("h3", null, "\u8BED\u97F3\u8F6C\u5199\u8BBE\u7F6E"), /* @__PURE__ */ import_react18.default.createElement("label", null, "\u65B0\u5F55\u97F3\u9ED8\u8BA4\u6A21\u578B", /* @__PURE__ */ import_react18.default.createElement("select", { "aria-label": "\u65B0\u5F55\u97F3\u9ED8\u8BA4\u8F6C\u5199\u6A21\u578B", value: state?.selected || "", disabled: busy || !state, onChange: (e) => update("select", e.target.value) }, !state?.selected && /* @__PURE__ */ import_react18.default.createElement("option", { value: "", disabled: true }, state ? "\u8BF7\u9009\u62E9\u6A21\u578B" : "\u8BFB\u53D6\u4E2D\u2026"), (state?.models || []).map((model) => /* @__PURE__ */ import_react18.default.createElement("option", { key: model.id, value: model.id }, model.label, " \xB7 ", modeName(model))))), disabled && /* @__PURE__ */ import_react18.default.createElement("p", { className: "small muted" }, current ? "\u672C\u573A\u4F7F\u7528 " + current.label + "\u3002" : "\u672C\u573A\u5F55\u97F3\u7684\u6A21\u578B\u9009\u62E9\u5DF2\u9501\u5B9A\u3002", "\u66F4\u6539\u9ED8\u8BA4\u6A21\u578B\u4F1A\u5728\u4E0B\u6B21\u5F55\u97F3\u751F\u6548\u3002"), selected && /* @__PURE__ */ import_react18.default.createElement("p", { className: "small" }, "\u9ED8\u8BA4\u4F7F\u7528 ", selected.label, " \xB7 ", phaseName(selected)), (state?.models || []).map((model) => /* @__PURE__ */ import_react18.default.createElement("section", { key: model.id, className: "mw-setting" }, /* @__PURE__ */ import_react18.default.createElement("strong", null, model.label), " ", /* @__PURE__ */ import_react18.default.createElement("span", { className: "badge" }, phaseName(model)), /* @__PURE__ */ import_react18.default.createElement("p", { className: "small muted" }, model.source, " \xB7 ", modeName(model), "\u3002", model.description), !model.ready && model.available && /* @__PURE__ */ import_react18.default.createElement("button", { type: "button", disabled: disabled || busy || model.busy, onClick: () => update("prepare", model.id) }, model.busy ? "\u6B63\u5728\u51C6\u5907\u2026" : "\u51C6\u5907 " + model.label))), /* @__PURE__ */ import_react18.default.createElement("p", { className: "small muted" }, "\u5BFC\u5165\u97F3\u89C6\u9891\u548C\u4F1A\u540E\u8865\u8F6C\u4F7F\u7528 SenseVoiceSmall\u3002"), restartRequired && !state?.models.find((model) => model.id === "sensevoice-local")?.ready && /* @__PURE__ */ import_react18.default.createElement("p", { role: "status" }, "\u8BED\u97F3\u8F93\u5165\u5DF2\u542F\u7528\uFF0C\u8BF7\u91CD\u542F Harness \u540E\u51C6\u5907 SenseVoiceSmall\u3002"), error && /* @__PURE__ */ import_react18.default.createElement("p", { role: "alert" }, error));
}

// src/client/main.jsx
var API3 = "/api/meeting-workspace";
var today = () => (/* @__PURE__ */ new Date()).toLocaleDateString("sv-SE");
var captureBadges = /* @__PURE__ */ new Set(["\u51C6\u5907\u5F55\u97F3", "\u5F55\u5236\u4E2D", "\u5F55\u97F3\u4E2D", "\u6682\u505C\u4E2D", "\u5F55\u97F3\u4E2D\u65AD", "\u5F55\u97F3\u542F\u52A8\u5931\u8D25"]);
var time = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
async function request(path, body, opts = {}) {
  const response = await fetch(API3 + path, { cache: "no-store", ...opts, ...body !== void 0 ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {} });
  const result = await readAPIResponse(response);
  if (!response.ok) throw Object.assign(Error(result.error || `\u8BF7\u6C42\u5931\u8D25 ${response.status}`), { status: response.status });
  return result;
}
function download(value, name, type = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(value instanceof Blob ? value : new Blob([value], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
}
function Modal({ title, children, onClose, onSave, saveLabel = "\u4FDD\u5B58", busy = false, error = "" }) {
  return /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-overlay", "data-dsh-no-drag": true }, /* @__PURE__ */ import_react19.default.createElement("form", { className: "mw-dialog", role: "dialog", "aria-modal": "true", "aria-label": title, onSubmit: (e) => {
    e.preventDefault();
    onSave?.(new FormData(e.currentTarget));
  } }, /* @__PURE__ */ import_react19.default.createElement("header", null, /* @__PURE__ */ import_react19.default.createElement("h2", null, title), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", "aria-label": "\u5173\u95ED", disabled: busy, onClick: onClose }, "\xD7")), children, error && /* @__PURE__ */ import_react19.default.createElement("p", { role: "alert", className: "mw-capture-warning" }, error), /* @__PURE__ */ import_react19.default.createElement("footer", null, /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", disabled: busy, onClick: onClose }, "\u53D6\u6D88"), onSave && /* @__PURE__ */ import_react19.default.createElement("button", { className: "primary", disabled: busy }, busy ? "\u5904\u7406\u4E2D\u2026" : saveLabel))));
}
function MeetingWorkspace({ service, entry, conversation, active = true, host }) {
  const [snapshot, setSnapshot] = (0, import_react19.useState)({ ready: false, data: emptyData(), revision: 0, capabilities: {} }), ref = (0, import_react19.useRef)(snapshot);
  const data = snapshot.data;
  const [tab, setTab] = (0, import_react19.useState)("meetings"), [selected, setSelected] = (0, import_react19.useState)(""), [search, setSearch] = (0, import_react19.useState)(""), [project, setProject] = (0, import_react19.useState)(""), [taskFilter, setTaskFilter] = (0, import_react19.useState)("open"), [owner, setOwner] = (0, import_react19.useState)(""), [sort, setSort] = (0, import_react19.useState)("date"), [taskDue, setTaskDue] = (0, import_react19.useState)("all"), [detailTab, setDetailTab] = (0, import_react19.useState)("notes"), [highlight, setHighlight] = (0, import_react19.useState)(null), [modal, setModal] = (0, import_react19.useState)(null), [draft, setDraft] = (0, import_react19.useState)({}), [busy, setBusy] = (0, import_react19.useState)(false), [error, setError] = (0, import_react19.useState)(""), [notice, setNotice] = (0, import_react19.useState)(""), [conversationOpen, setConversationOpen] = (0, import_react19.useState)(false), [recording, setRecording] = (0, import_react19.useState)(null), [recState, setRecState] = (0, import_react19.useState)({ seconds: 0 }), [playURL, setPlayURL] = (0, import_react19.useState)(""), [newProject, setNewProject] = (0, import_react19.useState)(null);
  const [sourceHit, setSourceHit] = (0, import_react19.useState)("");
  const [planToManage, setPlanToManage] = (0, import_react19.useState)(null), [deletedPlan, setDeletedPlan] = (0, import_react19.useState)(null);
  const [createPlan, setCreatePlan] = (0, import_react19.useState)(false), [taskProject, setTaskProject] = (0, import_react19.useState)("");
  const [assistantOpening, setAssistantOpening] = (0, import_react19.useState)(false), [assistantSources, setAssistantSources] = (0, import_react19.useState)([]);
  const assistantTicket = (0, import_react19.useRef)(0), assistantActive = (0, import_react19.useRef)(active), assistantTrigger = (0, import_react19.useRef)(null);
  assistantActive.current = active;
  const [picked, setPicked] = (0, import_react19.useState)([]), [exportFormat, setExportFormat] = (0, import_react19.useState)("txt");
  const contentRef = (0, import_react19.useRef)(null);
  const saveQueue = (0, import_react19.useRef)(Promise.resolve()), recorder = (0, import_react19.useRef)(null), recordId = (0, import_react19.useRef)(null), recordLines = (0, import_react19.useRef)([]), finalBlob = (0, import_react19.useRef)(null), nativeFinishing = (0, import_react19.useRef)(false), anchorRefs = (0, import_react19.useRef)({});
  (0, import_react19.useSyncExternalStore)(service.subscribe, service.getSnapshot, () => null);
  const currentSession = (0, import_react19.useSyncExternalStore)(service.subscribeSessions, service.currentSession, () => null);
  const hostSession = active ? currentSession : null;
  const chatSession = hostSession && service.ownsSession(hostSession) ? hostSession : null;
  const assistantBinding = data.assistant?.["session:" + chatSession] || Object.values(data.assistant || {}).find((value) => value?.sessionId === chatSession);
  const assistantScope = scopeFromBinding(assistantBinding);
  const setState = (s) => {
    ref.current = s;
    setSnapshot(s);
  };
  const refresh = async () => setState(await request("/state"));
  (0, import_react19.useEffect)(() => {
    refresh().catch((e) => setError(e.message));
    return () => {
      recorder.current?.dispose();
      if (playURL) URL.revokeObjectURL(playURL);
    };
  }, []);
  (0, import_react19.useEffect)(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [tab, selected]);
  (0, import_react19.useEffect)(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  (0, import_react19.useEffect)(() => {
    const before = (e) => {
      if (recordId.current && !recorder.current?.isNative) {
        e.preventDefault();
        e.returnValue = "\u5F55\u97F3\u5C1A\u672A\u4FDD\u5B58";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, []);
  (0, import_react19.useEffect)(() => {
    const activeCapture = snapshot.nativeCaptures?.[0];
    if (!activeCapture || recordId.current) return;
    const meeting = snapshot.data.meetings.find((m2) => m2.id === activeCapture.meetingId);
    if (!meeting) return;
    recordId.current = meeting.id;
    recordLines.current = [...meeting.transcript];
    const engine = new NativeRecorder({ meetingId: meeting.id, language: activeCapture.language, captureMode: activeCapture.captureMode, onState: setRecState, onTranscript: (row) => {
      const index = recordLines.current.findIndex((r) => r.id === row.id);
      if (index < 0) recordLines.current.push(row);
      else recordLines.current[index] = row;
      refresh().catch((e) => setError(e.message));
    } });
    recorder.current = engine;
    setRecording({ id: meeting.id, title: meeting.title, live: activeCapture.live, captureMode: activeCapture.captureMode, native: true, asrModel: activeCapture.asrModel });
    engine.attach(activeCapture.id).catch((e) => setError(e.message));
  }, [snapshot.nativeCaptures?.[0]?.id]);
  (0, import_react19.useEffect)(() => {
    if (!snapshot.ready) return;
    const timer = setInterval(() => refresh().catch(() => {
    }), 5e3);
    return () => clearInterval(timer);
  }, [snapshot.ready]);
  const run = async (fn) => {
    setError("");
    setBusy(true);
    try {
      return await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const commit = (change) => {
    const pending = saveQueue.current.then(async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const next = structuredClone(ref.current.data);
        change(next);
        validateData(next);
        const response = await fetch(API3 + "/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: ref.current.revision, data: next }) });
        const result = await readAPIResponse(response);
        if (response.status === 409 && attempt === 0) {
          await refresh();
          continue;
        }
        if (!response.ok) throw Error(result.error || "\u4FDD\u5B58\u5931\u8D25");
        setState(result);
        return result;
      }
    });
    saveQueue.current = pending.catch(() => {
    });
    return pending;
  };
  const updateMeeting = (id, change) => commit((d) => {
    const m2 = d.meetings.find((m3) => m3.id === id);
    if (!m2) throw Error("\u6765\u6E90\u4F1A\u8BAE\u4E0D\u5B58\u5728");
    change(m2);
  });
  const m = data.meetings.find((x) => x.id === selected);
  const pname = (id) => data.projects.find((p) => p.id === id)?.name || "\u672A\u5206\u7C7B";
  const ready = async () => {
    if (ref.current.ready) return true;
    const path = await host.pickDirectory();
    if (!path) return false;
    setState(await request("/location", { path }));
    return true;
  };
  const openModal = (kind, values = {}) => {
    setNewProject(null);
    setDraft(values);
    setModal(kind);
  };
  const chooseLocation = () => run(async () => {
    if (recording) throw Error("\u8BF7\u5148\u7ED3\u675F\u5F55\u97F3\u518D\u66F4\u6362\u8D44\u6599\u4F4D\u7F6E");
    const path = await host.pickDirectory();
    if (path) setState(await request("/location", { path }));
  });
  const goto = (id) => {
    setPicked([]);
    setSelected(id);
    setTab("records");
    setDetailTab("notes");
    setHighlight(null);
    setSourceHit("");
    setPlayURL("");
  };
  const locate = (index) => {
    setSourceHit("");
    setHighlight(index);
    setDetailTab((value) => value === "full" ? "notes" : value);
  };
  const editMeeting = () => openModal("meeting", { ...m, participants: m.participants.join("\u3001") });
  const openImport = () => run(async () => {
    if (!await ready()) return;
    openModal("import", { title: "", project: tab === "records" && project || "default", date: today(), text: "", file: null });
  });
  async function importFile(file) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setError("\u5355\u4E2A\u6587\u4EF6\u4E0A\u9650 25 MB");
      return;
    }
    if (/\.(txt|md|srt|vtt)$/i.test(file.name)) {
      const text = await file.text();
      setDraft((d) => ({ ...d, file: null, text, title: d.title || file.name.replace(/\.[^.]+$/, "") }));
    } else if (/^(audio|video)\//.test(file.type) || /\.(wav|mp3|m4a|mp4|webm|caf|mov)$/i.test(file.name)) {
      setDraft((d) => ({ ...d, file, title: d.title || file.name.replace(/\.[^.]+$/, "") }));
    } else {
      setError("\u8BF7\u9009\u62E9 TXT\u3001Markdown\u3001SRT\u3001VTT \u6216\u97F3\u89C6\u9891\u6587\u4EF6");
    }
  }
  async function uploadAudio(id, blob, name) {
    const response = await fetch(API3 + `/audio?meeting=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`, { method: "POST", headers: { "Content-Type": blob.type || "application/octet-stream" }, body: blob });
    const result = await readAPIResponse(response);
    if (!response.ok) throw Error(result.error || "\u97F3\u9891\u4FDD\u5B58\u5931\u8D25");
    return result;
  }
  async function transcribe(blob, ext = "wav", language = "auto") {
    const parts = await speechParts(await speechWav(blob)), results = [];
    for (const part of parts) {
      const response = await fetch(API3 + `/transcribe?language=${language}`, { method: "POST", headers: { "Content-Type": "audio/wav" }, body: part });
      const result = await readAPIResponse(response);
      if (!response.ok) throw Error(result.error || "\u8F6C\u5199\u5931\u8D25");
      if (typeof result.text !== "string") throw Error("\u8BED\u97F3\u6A21\u578B\u672A\u8FD4\u56DE\u6709\u6548\u6587\u5B57");
      results.push(result.text);
    }
    return results.join("\n");
  }
  async function organizeMeeting(id) {
    await request("/organize", { meetingId: id });
    await refresh();
    setNotice("\u4F1A\u8BAE\u5DF2\u4FDD\u5B58\uFF0CAI \u6B63\u5728\u6574\u7406");
  }
  const ensureRecordingMode = (live, id) => resolveRecordingModel({ live, id, readModels: () => request("/asr/models"), prepare: async (model) => {
    setNotice("\u6B63\u5728\u51C6\u5907\u672C\u5730\u8F6C\u5199\uFF0C\u8BF7\u7A0D\u5019\u2026");
    const result = await request("/asr/models", { action: "prepare", id: model });
    if (result.restartRequired) throw Error("\u8BED\u97F3\u8F93\u5165\u5DF2\u542F\u7528\uFF0C\u8BF7\u91CD\u542F Harness \u540E\u51C6\u5907\u6A21\u578B");
  } });
  async function saveModal(form) {
    const values = { ...draft, ...Object.fromEntries(form?.entries?.() || []) };
    await run(async () => {
      if (modal === "project") {
        const name = values.name?.trim();
        if (!name) throw Error("\u8BF7\u8F93\u5165\u9879\u76EE\u540D\u79F0");
        const projectId = values.id || crypto.randomUUID();
        await commit((d) => {
          if (d.projects.some((p) => p.name === name && p.id !== values.id)) throw Error("\u5DF2\u5B58\u5728\u540C\u540D\u9879\u76EE");
          if (values.id) d.projects.find((p) => p.id === values.id).name = name;
          else d.projects.push({ id: projectId, name });
        });
        if (values.returnToRecords) {
          setProject(projectId);
          setModal(null);
        } else setModal("projects");
        return;
      }
      if (modal === "meeting") {
        if (!values.title?.trim()) throw Error("\u8BF7\u8F93\u5165\u4F1A\u8BAE\u540D\u79F0");
        await updateMeeting(values.id, (item) => {
          item.title = values.title.trim();
          item.autoTitle = false;
          item.project = values.project;
          item.date = values.date;
          item.participants = values.participants.split(/[、,，]/).map((s) => s.trim()).filter(Boolean);
        });
        setModal(null);
        return;
      }
      if (modal === "import" && values.importMode === "minutes") {
        if (!values.minutesPreview) throw Error("\u8BF7\u5148\u8BFB\u53D6\u98DE\u4E66\u5999\u8BB0");
        const title = values.minutesTitle.trim();
        if (!title) throw Error("\u8BF7\u8F93\u5165\u4F1A\u8BAE\u540D\u79F0");
        const id = crypto.randomUUID();
        let result;
        await commit((data2) => {
          result = saveMinutesMeeting(data2, values.minutesPreview, { title, project: values.project, date: values.minutesDate }, id);
        });
        goto(result.id);
        setModal(null);
        if (result.duplicate) {
          setNotice("\u8FD9\u6761\u5999\u8BB0\u5DF2\u5BFC\u5165\uFF0C\u5DF2\u6253\u5F00\u539F\u4F1A\u8BAE");
          return;
        }
        await organizeMeeting(result.id);
        return;
      }
      if (modal === "import") {
        if (!values.title?.trim()) throw Error("\u8BF7\u8F93\u5165\u4F1A\u8BAE\u540D\u79F0");
        if (!values.text?.trim() && !values.file) throw Error("\u8BF7\u9009\u62E9\u6587\u4EF6\u6216\u7C98\u8D34\u9010\u5B57\u7A3F");
        const item = createMeeting(values.title, values.project, values.text, values.date);
        item.source = values.file ? "\u97F3\u89C6\u9891\u5BFC\u5165" : "\u9010\u5B57\u7A3F\u5BFC\u5165";
        const existing = !values.file && duplicateTranscript(ref.current.data, item);
        if (existing) {
          goto(existing.id);
          setModal(null);
          setNotice("\u8FD9\u4EFD\u9010\u5B57\u7A3F\u5DF2\u7ECF\u5BFC\u5165\uFF0C\u5DF2\u6253\u5F00\u539F\u4F1A\u8BAE");
          return;
        }
        await commit((d) => d.meetings.unshift(item));
        goto(item.id);
        if (values.file) {
          const file = values.file;
          const audio = await uploadAudio(item.id, file, file.name);
          await updateMeeting(item.id, (x) => {
            x.audio.push(audio);
            x.status = "\u5F85\u8F6C\u5199";
          });
          setModal(null);
          if (snapshot.capabilities.asrConfigured) {
            try {
              const text = await transcribe(file, file.name.split(".").at(-1));
              if (!text.trim()) throw Error("\u672C\u6B21\u672A\u8BC6\u522B\u51FA\u9010\u5B57\u7A3F\uFF0C\u53EF\u4FDD\u5B58\u539F\u97F3\u540E\u66F4\u6362\u6A21\u578B\u91CD\u8BD5");
              await updateMeeting(item.id, (x) => {
                x.transcript = parseTranscript(text);
                x.status = "\u5F85\u6574\u7406";
                x.aiStatus = "\u7B49\u5F85\u6574\u7406";
              });
            } catch (e) {
              throw Error("\u539F\u59CB\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C" + e.message);
            }
            await organizeMeeting(item.id);
          } else setNotice("\u539F\u59CB\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF1B\u5C1A\u672A\u914D\u7F6E\u672C\u5730\u8F6C\u5199\u670D\u52A1\uFF0C\u53EF\u7A0D\u540E\u8F6C\u5199");
          return;
        }
        setModal(null);
        await organizeMeeting(item.id);
        return;
      }
      if (modal === "task") {
        await commit((d) => {
          const meeting = d.meetings.find((m2) => m2.id === values.meetingId);
          if (!meeting) throw Error("\u6765\u6E90\u4F1A\u8BAE\u4E0D\u5B58\u5728");
          let task = meeting.tasks.find((t) => t.id === values.id);
          if (!task) {
            task = { id: values.id || crypto.randomUUID(), title: "\u65B0\u4EFB\u52A1", owner: "", due: "", done: false, ref: null };
            meeting.tasks.push(task);
          }
          patchTask(d, meeting.id, task.id, { title: values.title, owners: values.owners || taskOwners(values), due: values.due || "", project: values.project || meeting.project, done: !!values.done });
          task.ref = values.ref === "" || values.ref == null ? null : Number(values.ref);
        });
        setModal(null);
        return;
      }
      if (modal === "transcript") {
        let legacy = false;
        await updateMeeting(selected, (meeting) => {
          const rows2 = editTimeline(values.text, meetingTranscript(meeting));
          legacy = !!meeting.speakerTranscript?.length;
          if (legacy) meeting.speakerTranscript = rows2;
          else {
            meeting.transcript = rows2;
            meeting.summaryDiagram = null;
            meeting.decisions = meeting.decisions.map((d) => ({ ...d, ref: null }));
            meeting.tasks = meeting.tasks.map((t) => ({ ...t, ref: null }));
          }
          meeting.speakerAutoAttempted = true;
        });
        setNotice(legacy ? "\u9010\u5B57\u7A3F\u5DF2\u4FDD\u5B58" : "\u9010\u5B57\u7A3F\u5DF2\u4FDD\u5B58\uFF0C\u65E7\u5F15\u7528\u5DF2\u89E3\u9664\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u5173\u8054");
        setModal(null);
        if (!m?.summary) await organizeMeeting(selected);
        return;
      }
      if (modal === "record") {
        const native = !!ref.current.capabilities.systemAudio;
        if (native && !ref.current.capabilities.systemAudio) throw Error("\u5F53\u524D\u5BBF\u4E3B\u5C1A\u672A\u52A0\u8F7D\u7535\u8111\u58F0\u97F3\u91C7\u96C6\u7EC4\u4EF6");
        const choice = await ensureRecordingMode(values.live).catch((e) => {
          throw Error("\u672C\u6B21\u672A\u5F00\u59CB\u5F55\u97F3\uFF1A" + e.message);
        });
        const { live, asrModel } = choice, language = choice.language || values.language || "auto";
        const item = createMeeting(values.title?.trim() || "\u4F1A\u8BAE \xB7 " + today(), values.project);
        item.autoTitle = !values.title?.trim();
        item.asrModel = asrModel;
        item.status = "\u51C6\u5907\u5F55\u97F3";
        item.source = native ? values.captureMode === "microphone" ? "\u9EA6\u514B\u98CE" : "\u7535\u8111\u58F0\u97F3\uFF0B\u9EA6\u514B\u98CE" : "\u6D4F\u89C8\u5668\u9EA6\u514B\u98CE";
        await commit((d) => d.meetings.unshift(item));
        goto(item.id);
        const onTranscript = (row) => {
          const index = recordLines.current.findIndex((r) => r.id === row.id);
          if (index < 0) recordLines.current.push(row);
          else recordLines.current[index] = row;
          if (native) refresh().catch((e) => setError(e.message));
          else updateMeeting(item.id, (x) => {
            x.transcript = [...recordLines.current];
          }).catch((e) => setError(e.message));
        };
        const engine = native ? new NativeRecorder({ meetingId: item.id, onState: setRecState, onTranscript, captureMode: values.captureMode, language, expectedModel: asrModel }) : new BrowserRecorder({ onState: setRecState, onTranscript, transcribe: (blob) => transcribe(blob, "wav", language), language });
        recorder.current = engine;
        recordLines.current = [];
        recordId.current = item.id;
        finalBlob.current = null;
        try {
          await engine.start(live);
          if (native) await refresh();
          setRecording({ id: item.id, title: item.title, language, captureMode: values.captureMode, live, native, asrModel });
          if (!native) await updateMeeting(item.id, (x) => x.status = "\u5F55\u5236\u4E2D");
          setModal(null);
        } catch (e) {
          recordId.current = null;
          recorder.current = null;
          await refresh();
          await updateMeeting(item.id, (x) => x.status = "\u5F55\u97F3\u542F\u52A8\u5931\u8D25");
          throw Error("\u5F55\u97F3\u672A\u5F00\u59CB\uFF1A" + e.message);
        }
        return;
      }
    });
  }
  async function stopRecording() {
    await run(async () => {
      const id = recordId.current;
      if (!id) return;
      if (recorder.current?.isNative) {
        nativeFinishing.current = true;
        try {
          const result = await recorder.current.stop();
          await refresh();
          recordId.current = null;
          recorder.current = null;
          setRecording(null);
          if (result.error) setError(result.error);
          else if (result.warnings) setNotice("\u5F55\u97F3\u5DF2\u4FDD\u5B58\uFF0C\u90E8\u5206\u9010\u5B57\u7A3F\u9700\u8865\u8F6C");
          else setNotice(result.live ? "\u53CC\u8DEF\u5F55\u97F3\u5DF2\u4FDD\u5B58\uFF0C\u8BF7\u6838\u5BF9\u9010\u5B57\u7A3F" : "\u53CC\u8DEF\u5F55\u97F3\u5DF2\u4FDD\u5B58");
        } finally {
          nativeFinishing.current = false;
        }
        ;
        return;
      }
      const blob = finalBlob.current || await recorder.current.stop();
      finalBlob.current = blob;
      if (blob.size > 25 * 1024 * 1024) throw Error("\u5F55\u97F3\u8D85\u8FC7 25 MB\uFF0C\u8BF7\u5148\u4E0B\u8F7D\u672C\u673A\u97F3\u9891\uFF1B\u5206\u6BB5\u540E\u5BFC\u5165\u4FDD\u5B58");
      const audio = await uploadAudio(id, blob, "\u4F1A\u8BAE\u5F55\u97F3." + (blob.type.includes("mp4") ? "m4a" : "webm"));
      await updateMeeting(id, (x) => {
        x.audio.push(audio);
        x.duration = recorder.current.seconds;
        x.transcript = [...recordLines.current];
        x.status = x.transcript.length ? "\u5F85\u6574\u7406" : "\u5F85\u8F6C\u5199";
      });
      recordId.current = null;
      recorder.current = null;
      setRecording(null);
      setNotice(recordLines.current.length ? "\u5F55\u97F3\u548C\u9010\u5B57\u7A3F\u5DF2\u4FDD\u5B58" : "\u5F55\u97F3\u5DF2\u4FDD\u5B58\uFF0C\u672C\u6B21\u5C1A\u672A\u8BC6\u522B\u51FA\u9010\u5B57\u7A3F");
      if (!recordLines.current.length && ref.current.capabilities.asrConfigured) {
        await updateMeeting(id, (x) => x.aiStatus = "\u8F6C\u5199\u4E2D");
        try {
          const text = await transcribe(blob);
          if (!text.trim()) throw Error("\u672C\u6B21\u672A\u8BC6\u522B\u51FA\u6587\u5B57");
          await updateMeeting(id, (x) => {
            x.transcript = parseTranscript(text);
            x.status = "\u5F85\u6574\u7406";
            x.aiStatus = "\u7B49\u5F85\u6574\u7406";
          });
        } catch (error2) {
          await updateMeeting(id, (x) => {
            x.aiStatus = "\u5F85\u8865\u8F6C";
            x.aiError = "\u539F\u97F3\u5DF2\u4FDD\u5B58\uFF0C\u81EA\u52A8\u8F6C\u5199\u672A\u5B8C\u6210\uFF1A" + error2.message;
          });
          return;
        }
      }
      await organizeMeeting(id);
    });
  }
  (0, import_react19.useEffect)(() => {
    if (recState.native && recState.ended && recording?.native && !nativeFinishing.current) {
      const id = recordId.current;
      recordId.current = null;
      recorder.current = null;
      setRecording(null);
      refresh().catch((e) => setError(e.message));
      if (recState.error) setError(recState.error);
      else setNotice("\u5F55\u97F3\u5DF2\u7ED3\u675F\u5E76\u4FDD\u5B58");
    }
  }, [recState.ended, recording?.id]);
  const enableLive = () => run(async () => {
    await ensureRecordingMode(true, recording.asrModel);
    await recorder.current.enableTranscription();
    setRecording((r) => ({ ...r, live: true }));
    setNotice("\u672C\u573A\u540C\u6B65\u8F6C\u5199\u5DF2\u5F00\u542F");
  });
  const prepareSpeech = () => run(async () => {
    const state = await request("/asr/models", { action: "prepare", id: snapshot.capabilities.transcription?.selected });
    await refresh();
    setNotice(state.ready ? "\u6A21\u578B\u5DF2\u5C31\u7EEA" : state.restartRequired ? "\u8BED\u97F3\u8F93\u5165\u5DF2\u542F\u7528\uFF0C\u91CD\u542F Harness \u540E\u51C6\u5907\u6A21\u578B" : "\u6A21\u578B\u6B63\u5728\u51C6\u5907\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u67E5\u770B\u8FDB\u5EA6");
  });
  const editPeopleRoster = (name, available) => commit((d) => setTaskPersonAvailable(d, name, available));
  const editTaskCell = (t, patch, expected) => commit((d) => patchTask(d, t.meetingId || selected, t.id, patch, expected));
  const toggleTask = (t) => run(() => editTaskCell(t, { done: !t.done }, { done: t.done }));
  const taskEdit = (t) => openModal("task", { ...t, owners: taskOwners(t), project: t.project || data.meetings.find((m2) => m2.id === (t.meetingId || selected))?.project || "default", meetingId: t.meetingId || selected, ref: t.ref ?? "" });
  async function generateTitle() {
    await run(async () => {
      const previous = m.title, { title } = await request("/title", { transcript: m.transcript });
      await updateMeeting(m.id, (x) => {
        if (x.title === previous && x.autoTitle) {
          x.title = title.trim();
          x.titleStatus = "\u5DF2\u751F\u6210";
        }
      });
    });
  }
  function exportMinutes(format) {
    const item = ref.current.data.meetings.find((x) => x.id === draft.meetingId);
    if (!item) {
      setError("\u4F1A\u8BAE\u5DF2\u79FB\u9664\uFF0C\u65E0\u6CD5\u5BFC\u51FA");
      return;
    }
    const file = minutesFile(item, pname(item.project), format);
    download(file.content, file.name, file.type);
    setModal(null);
  }
  async function openAssistant(fresh = false, desired = assistantScope, specificId) {
    const ticket = ++assistantTicket.current;
    setAssistantOpening(true);
    setError("");
    try {
      if (!await ready() || ticket !== assistantTicket.current || !assistantActive.current) return;
      const { capabilities, data: data2, location } = ref.current;
      if (!capabilities.assistantAvailable) throw Error("\u4F1A\u8BAE\u68C0\u7D22\u670D\u52A1\u5C1A\u672A\u52A0\u8F7D");
      if (!specificId) selectedMeetings(data2, desired);
      const key = scopeKey(desired), saved = data2.assistant?.[key]?.sessionId;
      const previous = specificId || (!fresh && saved && service.ownsSession(saved) ? saved : null);
      if (specificId && !service.ownsSession(specificId)) throw Error("\u8BE5\u5BF9\u8BDD\u4E0D\u5C5E\u4E8E\u4F1A\u8BAE\u5DE5\u4F5C\u53F0");
      const sessionId = previous ? await service.ensureSession({ sessionId: previous }) : await service.ensureSession({ folder: location });
      if (!sessionId || ticket !== assistantTicket.current || !assistantActive.current) return;
      if (!service.ownsSession(sessionId)) throw Error("\u5BF9\u8BDD\u5F52\u5C5E\u5C1A\u672A\u786E\u8BA4\uFF0C\u8BF7\u91CD\u8BD5");
      await commit((next) => {
        if (ref.current.location !== location) throw Error("\u4F1A\u8BAE\u8D44\u6599\u4F4D\u7F6E\u5DF2\u6539\u53D8\uFF0C\u8BF7\u91CD\u65B0\u6253\u5F00\u5BF9\u8BDD");
        if (!specificId) selectedMeetings(next, desired);
        next.assistant ||= {};
        for (const [oldKey, old] of Object.entries(next.assistant)) {
          if (old?.sessionId && !oldKey.startsWith("session:")) next.assistant["session:" + old.sessionId] ||= { ...old };
        }
        const value = { sessionId, ...scopeBinding(desired) };
        next.assistant[key] = value;
        next.assistant["session:" + sessionId] = value;
        next.assistant.recent = value;
      });
      return sessionId;
    } catch (e) {
      if (ticket === assistantTicket.current) setError(e.message);
    } finally {
      if (ticket === assistantTicket.current) setAssistantOpening(false);
    }
  }
  function showAssistant() {
    setConversationOpen(true);
    if (chatSession || assistantOpening) return;
    const recent = data.assistant?.recent;
    if (recent?.sessionId && service.ownsSession(recent.sessionId)) openAssistant(false, scopeFromBinding(recent), recent.sessionId);
  }
  function hideAssistant() {
    setConversationOpen(false);
    requestAnimationFrame(() => assistantTrigger.current?.focus());
  }
  (0, import_react19.useEffect)(() => {
    if (!active) {
      assistantTicket.current++;
      setAssistantOpening(false);
    }
  }, [active]);
  (0, import_react19.useEffect)(() => {
    setAssistantSources([]);
    if (!conversationOpen || !chatSession || !active) return;
    const controller = new AbortController();
    let reading = false;
    async function poll() {
      if (reading) return;
      reading = true;
      try {
        const value = await request("/assistant/sources?sessionId=" + encodeURIComponent(chatSession), void 0, { signal: controller.signal });
        if (!controller.signal.aborted) setAssistantSources(value.sources || []);
      } catch {
      } finally {
        reading = false;
      }
    }
    poll();
    const timer = setInterval(poll, 2e3);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [active, conversationOpen, chatSession, snapshot.location]);
  const openAssistantSource = (source) => run(async () => {
    await refresh();
    const meeting = ref.current.data.meetings.find((x) => x.id === source.meetingId);
    if (!meeting) throw Error("\u6765\u6E90\u4F1A\u8BAE\u5DF2\u5220\u9664");
    goto(meeting.id);
    if (source.paragraphId) {
      const index = meeting.transcript.findIndex((r) => r.id === source.paragraphId);
      if (index < 0) {
        setNotice("\u539F\u6587\u5DF2\u4FEE\u6539\uFF0C\u8BF7\u5728\u4F1A\u8BAE\u4E2D\u91CD\u65B0\u68C0\u7D22");
        return;
      }
      setDetailTab("full");
      setTimeout(() => locate(index), 100);
    }
  });
  const showRecords = () => {
    setSelected("");
    setSearch("");
    setProject("");
    setTab("records");
  };
  const resetTaskFilters = () => {
    setTaskFilter("open");
    setTaskProject("");
    setOwner("");
    setTaskDue("all");
    setSort("date");
  };
  const showOpenTasks = () => {
    setSearch("");
    resetTaskFilters();
    setTab("tasks");
  };
  const managePlan = (id) => {
    const plan = ref.current.data.plans?.find((p) => p.id === id && !p.deletedAt);
    if (plan) setPlanToManage(structuredClone(plan));
    else setError("\u4F1A\u8BAE\u5B89\u6392\u5DF2\u5220\u9664\uFF0C\u8BF7\u91CD\u65B0\u67E5\u770B");
  };
  const startPlan = (id) => run(async () => {
    await request("/plans/start", { id, confirmed: true });
    await refresh();
    setTab("meetings");
  });
  const addTask = () => {
    if (!data.meetings.length) {
      setError("\u8BF7\u5148\u521B\u5EFA\u4E00\u573A\u6765\u6E90\u4F1A\u8BAE");
      return;
    }
    taskEdit({ title: "", owner: "", due: "", done: false, meetingId: data.meetings[0].id });
  };
  const rows = data.meetings.filter((x) => (tab !== "records" || !project || x.project === project) && (!search || [x.title, x.summary, ...meetingTranscript(x).map((r) => r.text)].join(" ").toLowerCase().includes(search.toLowerCase())));
  const protectedIds = () => [recordId.current, ...(ref.current.nativeCaptures || []).map((x) => x.meetingId)].filter(Boolean);
  const protectedSet = new Set(protectedIds());
  const selectable = rows.filter((x) => !protectedSet.has(x.id));
  const chosen = selectable.filter((x) => picked.includes(x.id));
  const chosenIds = chosen.map((x) => x.id), allChosen = !!selectable.length && chosen.length === selectable.length;
  (0, import_react19.useEffect)(() => setPicked([]), [search, project, tab]);
  (0, import_react19.useEffect)(() => {
    if (snapshot.ready && project && !data.projects.some((p) => p.id === project)) setProject("");
  }, [snapshot.ready, project, data.projects]);
  (0, import_react19.useEffect)(() => setPicked((previous) => {
    const valid = new Set(data.meetings.map((x) => x.id));
    return previous.every((id) => valid.has(id)) ? previous : previous.filter((id) => valid.has(id));
  }), [data.meetings]);
  const toggleMeeting = (id) => setPicked((previous) => previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id]);
  const exportSelected = () => run(async () => {
    const result = transcriptArchive(ref.current.data, chosenIds, exportFormat);
    download(new Blob([result.bytes], { type: "application/zip" }), `\u4F1A\u8BAE\u9010\u5B57\u7A3F_${today()}_${result.count}\u573A.zip`, "application/zip");
    setNotice(`\u5DF2\u5BFC\u51FA ${result.count} \u573A\u4F1A\u8BAE\u9010\u5B57\u7A3F${result.skipped ? `\uFF0C\u8DF3\u8FC7 ${result.skipped} \u573A\u65E0\u9010\u5B57\u7A3F\u4F1A\u8BAE` : ""}`);
  });
  const taskPeople = peopleFor(data);
  (0, import_react19.useEffect)(() => {
    if (owner && !taskPeople.includes(owner)) setOwner("");
  }, [owner, taskPeople]);
  const tasks = allTasks(data).filter((t) => (taskFilter === "all" || (taskFilter === "done" ? t.done : !t.done)) && (!owner || taskOwners(t).includes(owner)) && (!taskProject || t.project === taskProject) && taskMatchesDue(t, taskDue, today()) && (!search || [t.title, t.owner, t.meetingTitle].join().toLowerCase().includes(search.toLowerCase()))).sort((a, b) => sort === "date" ? (a.due || "9999").localeCompare(b.due || "9999") : a.title.localeCompare(b.title));
  const field = (key, props = {}) => /* @__PURE__ */ import_react19.default.createElement("input", { name: key, ...props, value: draft[key] ?? "", onChange: (e) => setDraft({ ...draft, [key]: e.target.value }) });
  const projectSelect = (value, change) => /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-project-picker" }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react19.default.createElement("select", { "aria-label": "\u6240\u5C5E\u9879\u76EE", value, onChange: (e) => change(e.target.value) }, data.projects.map((p) => /* @__PURE__ */ import_react19.default.createElement("option", { key: p.id, value: p.id }, p.name))), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", onClick: () => setNewProject("") }, "\uFF0B \u65B0\u5EFA\u9879\u76EE")), newProject !== null && /* @__PURE__ */ import_react19.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react19.default.createElement("input", { "aria-label": "\u65B0\u9879\u76EE\u540D\u79F0", placeholder: "\u9879\u76EE\u540D\u79F0", maxLength: 100, value: newProject, onChange: (e) => setNewProject(e.target.value) }), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", disabled: busy || !newProject.trim(), onClick: () => run(async () => {
    const name = newProject.trim(), id = crypto.randomUUID();
    await commit((d) => {
      if (d.projects.some((p) => p.name === name)) throw Error("\u5DF2\u5B58\u5728\u540C\u540D\u9879\u76EE");
      d.projects.push({ id, name });
    });
    change(id);
    setNewProject(null);
  }) }, "\u521B\u5EFA\u5E76\u9009\u62E9"), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", onClick: () => setNewProject(null) }, "\u53D6\u6D88")));
  const taskRows = (items, global = false) => /* @__PURE__ */ import_react19.default.createElement(TaskTable, { items: items.map((t) => ({ ...t, meetingId: t.meetingId || selected, meetingTitle: t.meetingTitle || m?.title, project: t.project || m?.project || "default" })), data, global, today: today(), onPatch: editTaskCell, onRosterChange: editPeopleRoster, onToggle: toggleTask, onMeeting: goto, onDelete: (t) => openModal("deleteTask", t) });
  const renderMeetingRows = (items, selection = true) => items.map((item) => /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-meeting-row" + (chosenIds.includes(item.id) ? " is-selected" : ""), key: item.id }, selection && /* @__PURE__ */ import_react19.default.createElement("label", { className: "mw-meeting-pick", title: protectedSet.has(item.id) ? "\u5F55\u97F3\u4E2D\uFF0C\u8BF7\u5148\u7ED3\u675F\u5E76\u4FDD\u5B58" : "\u9009\u62E9 " + item.title }, /* @__PURE__ */ import_react19.default.createElement(
    "input",
    {
      className: "mw-circle-check",
      type: "checkbox",
      "aria-label": "\u9009\u62E9\u4F1A\u8BAE " + item.title,
      checked: chosenIds.includes(item.id),
      disabled: busy || protectedSet.has(item.id),
      onChange: () => toggleMeeting(item.id)
    }
  )), /* @__PURE__ */ import_react19.default.createElement("button", { className: "mw-meeting", onClick: () => goto(item.id) }, /* @__PURE__ */ import_react19.default.createElement("span", { className: "mw-file-icon" }, /* @__PURE__ */ import_react19.default.createElement(WorkspaceIcon, { name: "document", size: 18 })), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-meeting-body" }, /* @__PURE__ */ import_react19.default.createElement("h3", null, item.title), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-meeting-meta" }, /* @__PURE__ */ import_react19.default.createElement("time", { dateTime: item.date }, item.date), item.duration > 0 && /* @__PURE__ */ import_react19.default.createElement("span", null, time(item.duration)), !selection && /* @__PURE__ */ import_react19.default.createElement("span", null, pname(item.project)), item.participants.length > 0 && /* @__PURE__ */ import_react19.default.createElement("span", { className: "mw-participants" }, item.participants.join("\u3001"))), (item.summary || meetingTranscript(item)[0]?.text) && /* @__PURE__ */ import_react19.default.createElement("p", null, item.summary || meetingTranscript(item)[0].text)), /* @__PURE__ */ import_react19.default.createElement("span", { className: "mw-meeting-end" }, captureBadges.has(item.status) && /* @__PURE__ */ import_react19.default.createElement("span", { className: "badge" }, item.status), /* @__PURE__ */ import_react19.default.createElement(WorkspaceIcon, { name: "forward", size: 15 })))));
  const bulkToolbar = !!rows.length && /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-bulk-toolbar" }, /* @__PURE__ */ import_react19.default.createElement("label", { className: "mw-select-all" }, /* @__PURE__ */ import_react19.default.createElement("input", { className: "mw-circle-check", type: "checkbox", "aria-label": "\u5168\u9009\u5F53\u524D\u5217\u8868", checked: allChosen, ref: (el) => {
    if (el) el.indeterminate = chosen.length > 0 && !allChosen;
  }, disabled: busy || !selectable.length, onChange: () => setPicked(allChosen ? [] : selectable.map((x) => x.id)) }), /* @__PURE__ */ import_react19.default.createElement("span", null, chosen.length ? `\u5DF2\u9009 ${chosen.length} \u573A` : "\u5168\u9009")), !!chosen.length && /* @__PURE__ */ import_react19.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react19.default.createElement("select", { "aria-label": "\u9010\u5B57\u7A3F\u5BFC\u51FA\u683C\u5F0F", value: exportFormat, onChange: (e) => setExportFormat(e.target.value) }, /* @__PURE__ */ import_react19.default.createElement("option", { value: "txt" }, "TXT"), /* @__PURE__ */ import_react19.default.createElement("option", { value: "md" }, "Markdown")), /* @__PURE__ */ import_react19.default.createElement("button", { disabled: busy, onClick: exportSelected }, "\u5BFC\u51FA\u9010\u5B57\u7A3F"), /* @__PURE__ */ import_react19.default.createElement("button", { className: "danger", disabled: busy, onClick: () => openModal("deleteMeetings", { ids: chosenIds }) }, "\u6279\u91CF\u5220\u9664"), /* @__PURE__ */ import_react19.default.createElement("button", { className: "link", disabled: busy, onClick: () => setPicked([]) }, "\u53D6\u6D88\u9009\u62E9")));
  const speakerBusy = snapshot.speakerJobs?.includes(m?.id);
  const canAutoAnalyze = tab === "records" && !recording && !snapshot.speakerJobs?.length && needsSpeakerAnalysis(m);
  (0, import_react19.useEffect)(() => {
    if (!canAutoAnalyze) return;
    request("/speakers/auto", { meetingId: m.id }).then((result) => {
      if (result.started) return refresh();
    }).catch(() => {
    });
  }, [canAutoAnalyze, m?.id]);
  const timeline = m ? meetingTranscript(m) : [];
  const citation = m?.transcript[highlight];
  const activeSource = sourceHit || citation?.id;
  const savedExcerpt = citation && !sourceHit && !timeline.some((row) => row.id === citation.id) ? citation : null;
  const sourceAnchor = (id, el) => {
    anchorRefs.current[id] = el;
  };
  (0, import_react19.useEffect)(() => {
    if (activeSource && tab === "records" && detailTab !== "full") {
      anchorRefs.current[activeSource]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeSource, detailTab, tab, m?.id, savedExcerpt?.id]);
  return /* @__PURE__ */ import_react19.default.createElement("div", { className: "meeting-workspace", "data-testid": "meeting-workspace" }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-popover-layer" }), /* @__PURE__ */ import_react19.default.createElement("style", null, style_default + assistant_theme_default), /* @__PURE__ */ import_react19.default.createElement("header", { className: "mw-nav" }, /* @__PURE__ */ import_react19.default.createElement("div", { role: "tablist", "aria-label": "\u4F1A\u8BAE\u4E1A\u52A1\u5BFC\u822A" }, [["meetings", "\u4F1A\u8BAE\u5DE5\u4F5C\u53F0"], ["records", "\u4F1A\u8BAE\u8BB0\u5F55"], ["prepare", "\u4F1A\u8BAE\u5B89\u6392"], ["tasks", "\u4EFB\u52A1\u5B89\u6392"]].map(([id, title]) => /* @__PURE__ */ import_react19.default.createElement("button", { role: "tab", "aria-selected": tab === id, key: id, className: tab === id ? "active" : "", onClick: () => {
    setTab(id);
    if (id === "meetings" || id === "records") setSelected("");
  } }, title))), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-tools" }, /* @__PURE__ */ import_react19.default.createElement("label", { className: "mw-global-search" }, /* @__PURE__ */ import_react19.default.createElement(WorkspaceIcon, { name: "search", size: 15 }), /* @__PURE__ */ import_react19.default.createElement("input", { "aria-label": "\u5173\u952E\u8BCD\u641C\u7D22", placeholder: "\u641C\u7D22\u4F1A\u8BAE\u3001\u539F\u6587\u3001\u4EFB\u52A1\u2026", value: search, onChange: (e) => setSearch(e.target.value) })), /* @__PURE__ */ import_react19.default.createElement("button", { ref: assistantTrigger, type: "button", "aria-controls": "mw-meeting-assistant-panel", "aria-expanded": conversationOpen, className: conversationOpen ? "mw-assistant-active" : "", onClick: conversationOpen ? hideAssistant : showAssistant }, "\u4F1A\u8BAE\u52A9\u624B"), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => setModal("settings") }, "\u8BBE\u7F6E"))), deletedPlan && /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-notice mw-plan-undo", role: "status" }, /* @__PURE__ */ import_react19.default.createElement("span", null, "\u4F1A\u8BAE\u5B89\u6392\u5DF2\u5220\u9664"), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", disabled: busy, onClick: () => run(async () => {
    await commit((d) => restorePlan(d, deletedPlan));
    setDeletedPlan(null);
  }) }, "\u64A4\u9500\u5220\u9664"), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", className: "link", "aria-label": "\u5173\u95ED\u5220\u9664\u63D0\u793A", onClick: () => setDeletedPlan(null) }, "\u5173\u95ED")), error && /* @__PURE__ */ import_react19.default.createElement("div", { role: "alert", className: "mw-error" }, error, /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => setError("") }, "\u5173\u95ED")), notice && /* @__PURE__ */ import_react19.default.createElement("div", { role: "status", className: "mw-notice" }, notice), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-frame mw-docked-frame" + (conversationOpen ? " is-assistant-open" : "") }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-business-pane" }, /* @__PURE__ */ import_react19.default.createElement("main", { ref: contentRef, className: "mw-content" + (tab === "meetings" ? " mw-home-content" : "") }, !!data.plans?.some((p) => ["\u63D0\u9192\u4E2D", "\u5F85\u786E\u8BA4"].includes(p.status)) && tab !== "prepare" && /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-notice" }, /* @__PURE__ */ import_react19.default.createElement("span", null, "\u6709\u4F1A\u8BAE\u7B49\u5F85\u786E\u8BA4\u662F\u5426\u5F00\u59CB\u8BB0\u5F55"), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => setTab("prepare") }, "\u67E5\u770B\u4F1A\u8BAE\u5B89\u6392")), !snapshot.ready && /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-welcome" }, /* @__PURE__ */ import_react19.default.createElement("div", null, /* @__PURE__ */ import_react19.default.createElement("h2", null, "\u5148\u4E3A\u4F1A\u8BAE\u8D44\u6599\u9009\u4E00\u4E2A\u672C\u5730\u4F4D\u7F6E")), /* @__PURE__ */ import_react19.default.createElement("button", { className: "primary", onClick: chooseLocation }, "\u9009\u62E9\u8D44\u6599\u6587\u4EF6\u5939")), recording && /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-live" }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-live-head" }, /* @__PURE__ */ import_react19.default.createElement("div", null, /* @__PURE__ */ import_react19.default.createElement("span", { className: "badge" }, recording.native && recording.captureMode !== "microphone" ? "\u7535\u8111\u58F0\u97F3\uFF0B\u9EA6\u514B\u98CE" : "\u9EA6\u514B\u98CE\u5F55\u97F3"), /* @__PURE__ */ import_react19.default.createElement("h2", null, recording.title), /* @__PURE__ */ import_react19.default.createElement("p", null, recording.live ? recording.asrModel === "x-asr" ? "X-ASR \xB7 \u672C\u673A\u6D41\u5F0F\u8F6C\u5199" : "SenseVoiceSmall \xB7 \u672C\u673A\u5206\u6BB5\u8F6C\u5199" : "\u4EC5\u5F55\u97F3 \xB7 \u672A\u5F00\u542F\u540C\u6B65\u8F6C\u5199")), /* @__PURE__ */ import_react19.default.createElement("strong", { className: "clock" }, time(recState.seconds || 0))), recording.native && /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-source-status" }, /* @__PURE__ */ import_react19.default.createElement("span", null, "\u9EA6\u514B\u98CE \xB7 ", recState.paused ? "\u5DF2\u6682\u505C" : recState.microphoneRecovering ? "\u6B63\u5728\u91CD\u8FDE" : recState.microphoneLevel > 2e-3 ? "\u6709\u58F0\u97F3" : recState.microphoneFrames ? "\u7B49\u5F85\u53D1\u8A00" : "\u7B49\u5F85\u8F93\u5165"), recording.captureMode !== "microphone" && /* @__PURE__ */ import_react19.default.createElement("span", null, "\u7535\u8111\u58F0\u97F3 \xB7 ", recState.paused ? "\u5DF2\u6682\u505C" : recState.systemLevel > 2e-3 ? "\u6709\u58F0\u97F3" : recState.systemFrames ? "\u7B49\u5F85\u53D1\u8A00" : "\u7B49\u5F85\u8F93\u5165"), /* @__PURE__ */ import_react19.default.createElement("span", null, "\u53D1\u8A00\u4EBA \xB7 ", recState.speakerState === "active" ? "\u81EA\u52A8\u533A\u5206\u4E2D" : recState.speakerState === "failed" ? "\u4F1A\u540E\u91CD\u8BD5" : recState.speakerState === "initializing" ? "\u7B49\u5F85\u8BED\u97F3\u5206\u6790" : "\u6A21\u578B\u672A\u5C31\u7EEA")), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-waveform", role: "img", "aria-label": recState.paused ? "\u5F55\u97F3\u5DF2\u6682\u505C" : recording.native ? "\u53CC\u8DEF\u58F0\u97F3\u6CE2\u5F62" : "\u9EA6\u514B\u98CE\u58F0\u97F3\u6CE2\u5F62" }, (recState.levels || Array(25).fill(0)).map((level, i) => /* @__PURE__ */ import_react19.default.createElement("i", { key: i, style: { height: 4 + Math.min(1, Math.pow(level * 5, 0.6)) * 48 + "px" } }))), /* @__PURE__ */ import_react19.default.createElement("p", { className: "muted" }, recState.status || "\u6B63\u5728\u51C6\u5907\u97F3\u9891", recState.pending > 0 && ` \xB7 ${recState.pending} \u6BB5\u8BC6\u522B\u4E2D`), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-live-text" }, recordLines.current.slice(-3).map((r) => /* @__PURE__ */ import_react19.default.createElement("p", { key: r.id }, /* @__PURE__ */ import_react19.default.createElement("small", null, r.time, " \xB7 ", r.speaker === "\u53D1\u8A00\u4EBA" ? "\u5F85\u8BC6\u522B\u53D1\u8A00\u4EBA" : r.speaker + (r.speakerAutomatic === "live" ? "\uFF08\u6682\u5B9A\uFF09" : ""), " \xB7 \u5DF2\u786E\u8BA4"), /* @__PURE__ */ import_react19.default.createElement("br", null), r.text)), recState.interim?.map((r) => /* @__PURE__ */ import_react19.default.createElement("p", { key: r.id }, /* @__PURE__ */ import_react19.default.createElement("small", null, r.time, " \xB7 \u6B63\u5728\u8BC6\u522B"), /* @__PURE__ */ import_react19.default.createElement("br", null), r.text, /* @__PURE__ */ import_react19.default.createElement("span", { className: "mw-interim" }, r.stash))), !recordLines.current.length && !recState.interim?.length && /* @__PURE__ */ import_react19.default.createElement("p", { className: "muted" }, recording.live ? recState.status?.includes("\u5931\u8D25") ? "\u8BC6\u522B\u6682\u672A\u6210\u529F\uFF0C\u5F55\u97F3\u4ECD\u4F1A\u4FDD\u5B58\u3002\u7ED3\u675F\u540E\u53EF\u91CD\u8BD5\u751F\u6210\u9010\u5B57\u7A3F\u3002" : recState.streaming ? "\u7B49\u5F85\u53D1\u8A00\uFF0C\u8BC6\u522B\u4E2D\u7684\u6587\u5B57\u4F1A\u5148\u663E\u793A\u5728\u8FD9\u91CC\u3002" : recState.pending ? "\u6B63\u5728\u8BC6\u522B\uFF0C\u786E\u8BA4\u540E\u5C06\u5728\u8FD9\u91CC\u663E\u793A\u9010\u5B57\u7A3F\u3002" : "\u7B49\u5F85\u53D1\u8A00\uFF0C\u7EA6\u6BCF 6 \u79D2\u786E\u8BA4\u4E00\u6BB5\u9010\u5B57\u7A3F\u3002" : "\u70B9\u51FB\u201C\u5F00\u542F\u540C\u6B65\u8F6C\u5199\u201D\u5373\u53EF\u4ECE\u73B0\u5728\u5F00\u59CB\u8BC6\u522B\uFF1B\u4E4B\u524D\u7684\u97F3\u9891\u4FDD\u5B58\u540E\u53EF\u8865\u8F6C\u3002")), /* @__PURE__ */ import_react19.default.createElement("div", { className: "actions" }, !recording.live && /* @__PURE__ */ import_react19.default.createElement("button", { className: "primary", disabled: busy, onClick: enableLive }, "\u5F00\u542F\u540C\u6B65\u8F6C\u5199"), recording.native && /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => run(() => request("/capture/control", { id: recorder.current.id, action: "show-window" })) }, "\u663E\u793A\u60AC\u6D6E\u7A97"), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => run(() => recorder.current.pause()), disabled: busy || recState.starting || recState.stopping }, recState.paused ? "\u7EE7\u7EED" : "\u6682\u505C"), /* @__PURE__ */ import_react19.default.createElement("button", { className: "primary", disabled: busy, onClick: stopRecording }, recState.starting ? "\u53D6\u6D88\u542F\u52A8" : "\u7ED3\u675F\u5E76\u4FDD\u5B58"), finalBlob.current && /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => download(finalBlob.current, "\u4F1A\u8BAE\u5F55\u97F3.webm", finalBlob.current.type) }, "\u4E0B\u8F7D\u672A\u4FDD\u5B58\u5F55\u97F3"))), tab === "meetings" && /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-heading mw-home-heading" }, /* @__PURE__ */ import_react19.default.createElement("div", null, /* @__PURE__ */ import_react19.default.createElement("h1", null, "\u4F1A\u8BAE\u5DE5\u4F5C\u53F0"), /* @__PURE__ */ import_react19.default.createElement("p", null, (/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" }))), /* @__PURE__ */ import_react19.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react19.default.createElement("button", { className: "mw-action-icon", onClick: openImport, disabled: busy }, /* @__PURE__ */ import_react19.default.createElement(WorkspaceIcon, { name: "import" }), "\u5BFC\u5165\u4F1A\u8BAE"), /* @__PURE__ */ import_react19.default.createElement("button", { className: "primary mw-action-icon", disabled: busy || !!recording, onClick: () => run(async () => {
    if (await ready()) openModal("record", { title: "", project: "default", language: "auto", live: true, captureMode: snapshot.capabilities.systemAudio ? "system-microphone" : "microphone" });
  }) }, /* @__PURE__ */ import_react19.default.createElement(WorkspaceIcon, { name: "record" }), "\u5F00\u59CB\u8BB0\u5F55"))), /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-home-counts", "aria-label": "\u5DE5\u4F5C\u53F0\u6982\u89C8" }, [[data.meetings.length, "\u5DF2\u6536\u5F55\u4F1A\u8BAE", showRecords], [allTasks(data).filter((t) => !t.done).length, "\u5F85\u8DDF\u8FDB\u884C\u52A8", showOpenTasks], [data.projects.length, "\u9879\u76EE\u5206\u7C7B", showRecords]].map(
    ([count, label, onClick]) => /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", key: label, "aria-label": "\u67E5\u770B" + label, onClick }, /* @__PURE__ */ import_react19.default.createElement("strong", null, count), /* @__PURE__ */ import_react19.default.createElement("span", null, label))
  )), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-home-grid" }, /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-card mw-home-recent", "aria-label": "\u8FD1\u671F\u4F1A\u8BAE" }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-card-head" }, /* @__PURE__ */ import_react19.default.createElement("h2", null, "\u8FD1\u671F\u4F1A\u8BAE"), /* @__PURE__ */ import_react19.default.createElement("button", { className: "link", onClick: () => {
    setSelected("");
    setTab("records");
  } }, "\u67E5\u770B\u5168\u90E8\u4F1A\u8BAE")), renderMeetingRows([...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), false), !rows.length && /* @__PURE__ */ import_react19.default.createElement("p", { className: "empty" }, data.meetings.length ? "\u6CA1\u6709\u7B26\u5408\u7B5B\u9009\u6761\u4EF6\u7684\u4F1A\u8BAE\u3002" : "\u5F55\u5236\u6216\u5BFC\u5165\u7B2C\u4E00\u573A\u4F1A\u8BAE\uFF0C\u5B83\u5C31\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002")), /* @__PURE__ */ import_react19.default.createElement(
    Dashboard,
    {
      data,
      project: "",
      today: today(),
      busy,
      recording: !!recording,
      onPlans: () => setTab("prepare"),
      onAddPlan: () => {
        setCreatePlan(true);
        setTab("prepare");
      },
      onStart: startPlan,
      onManagePlan: managePlan,
      onTasks: showOpenTasks,
      onAddTask: addTask,
      onToggleTask: toggleTask,
      onMeeting: goto
    }
  ))), tab === "records" && !m && /* @__PURE__ */ import_react19.default.createElement(MeetingRecords, { data, rows: [...rows].sort((a, b) => b.date.localeCompare(a.date)), project, onProject: setProject, busy, onManageProjects: () => run(async () => {
    if (await ready()) setModal("projects");
  }), onNewProject: () => run(async () => {
    if (await ready()) openModal("project", { name: "", returnToRecords: true });
  }), onImport: openImport, toolbar: bulkToolbar, renderMeetings: renderMeetingRows }), tab === "records" && m && /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("button", { className: "link", onClick: () => setSelected("") }, "\u2190 \u8FD4\u56DE\u4F1A\u8BAE\u8BB0\u5F55"), /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-heading mw-detail-heading" }, /* @__PURE__ */ import_react19.default.createElement("div", null, /* @__PURE__ */ import_react19.default.createElement("h1", null, m.title), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-detail-meta" }, /* @__PURE__ */ import_react19.default.createElement("time", { dateTime: m.date }, m.date), /* @__PURE__ */ import_react19.default.createElement("span", null, pname(m.project)), /* @__PURE__ */ import_react19.default.createElement("span", null, m.source), captureBadges.has(m.status) && /* @__PURE__ */ import_react19.default.createElement("span", { className: "badge" }, m.status))), /* @__PURE__ */ import_react19.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react19.default.createElement("button", { onClick: editMeeting }, "\u7F16\u8F91\u4F1A\u8BAE"), m.autoTitle && m.titleStatus !== "\u5DF2\u751F\u6210" && /* @__PURE__ */ import_react19.default.createElement("button", { disabled: busy || !m.transcript.length, onClick: generateTitle }, "\u751F\u6210\u6807\u9898"), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => openModal("exportMinutes", { meetingId: m.id }) }, "\u5BFC\u51FA\u7EAA\u8981"), /* @__PURE__ */ import_react19.default.createElement("button", { className: "danger", disabled: recording?.id === m.id, onClick: () => setModal("deleteMeeting") }, "\u5220\u9664"))), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-detail" + (detailTab === "full" ? " mw-detail-transcript" : "") }, /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-card" }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-tabs" }, [["notes", "\u4F1A\u8BAE\u7EAA\u8981"], ["tasks", "\u884C\u52A8\u4E8B\u9879"], ["full", "\u5B8C\u6574\u9010\u5B57\u7A3F"]].map(([id, title]) => /* @__PURE__ */ import_react19.default.createElement("button", { key: id, className: detailTab === id ? "active" : "", "aria-pressed": detailTab === id, onClick: () => setDetailTab(id) }, title, id === "full" && timeline.length > 0 && /* @__PURE__ */ import_react19.default.createElement("small", null, timeline.length)))), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-document" }, detailTab === "notes" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-card-head" }, /* @__PURE__ */ import_react19.default.createElement("h2", null, "\u4F1A\u8BAE\u6458\u8981")), m.aiError && /* @__PURE__ */ import_react19.default.createElement("p", { role: "alert", className: "mw-capture-warning" }, m.aiError), m.generatedSummary && /* @__PURE__ */ import_react19.default.createElement("details", { className: "mw-generated-summary" }, /* @__PURE__ */ import_react19.default.createElement("summary", null, "\u67E5\u770B\u53E6\u5B58\u7684 AI \u6458\u8981"), /* @__PURE__ */ import_react19.default.createElement(SummaryText, { text: m.generatedSummary })), /* @__PURE__ */ import_react19.default.createElement(MeetingSummary, { key: m.id, meeting: m, onLocate: locate }), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-card-head" }, /* @__PURE__ */ import_react19.default.createElement("h2", null, "\u884C\u52A8\u4E8B\u9879"), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => taskEdit({ title: "", owner: "", due: "", done: false, meetingId: m.id }) }, "\u6DFB\u52A0\u4EFB\u52A1")), taskRows(m.tasks), Array.isArray(m.liveQuestions) && m.liveQuestions.length > 0 && /* @__PURE__ */ import_react19.default.createElement("details", { className: "mw-summary-diagram" }, /* @__PURE__ */ import_react19.default.createElement("summary", null, "\u4F1A\u4E2D\u95EE\u7B54 \xB7 ", m.liveQuestions.length, " \u6761"), m.liveQuestions.map((row, i) => /* @__PURE__ */ import_react19.default.createElement("section", { key: i }, /* @__PURE__ */ import_react19.default.createElement("h3", null, row.question), /* @__PURE__ */ import_react19.default.createElement(SummaryText, { text: row.answer }))))) : detailTab === "tasks" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => taskEdit({ title: "", owner: "", due: "", done: false, meetingId: m.id }) }, "\u6DFB\u52A0\u4EFB\u52A1"), taskRows(m.tasks)) : /* @__PURE__ */ import_react19.default.createElement(
    TranscriptTimeline,
    {
      key: m.id,
      rows: timeline,
      busy: speakerBusy,
      canEdit: recording?.id !== m.id && !speakerBusy,
      onEdit: () => openModal("transcript", { text: editableTimeline(timeline) })
    }
  ), m.audioClearedAt && !m.audio.length && /* @__PURE__ */ import_react19.default.createElement("p", { className: "small muted" }, "\u5F55\u97F3\u5DF2\u6E05\u7406\uFF0C\u7EAA\u8981\u3001\u9010\u5B57\u7A3F\u4E0E\u4EFB\u52A1\u5DF2\u4FDD\u7559\u3002"), meetingAudio(m).length > 0 && /* @__PURE__ */ import_react19.default.createElement("section", null, /* @__PURE__ */ import_react19.default.createElement("h2", null, "\u4F1A\u8BAE\u97F3\u9891"), (m.captureError || m.captureWarning) && /* @__PURE__ */ import_react19.default.createElement("p", { className: "mw-capture-warning" }, m.captureError || m.captureWarning), meetingAudio(m).map((a) => /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-audio", key: a.id }, /* @__PURE__ */ import_react19.default.createElement("span", null, a.name), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => run(async () => {
    const r = await fetch(API3 + "/audio?id=" + a.id);
    if (!r.ok) throw Error("\u97F3\u9891\u6587\u4EF6\u65E0\u6CD5\u8BFB\u53D6");
    const b = await r.blob();
    if (playURL) URL.revokeObjectURL(playURL);
    setPlayURL(URL.createObjectURL(b));
  }) }, "\u52A0\u8F7D\u56DE\u653E"), (!a.source || a.source === "mixed" || a.source === "recovered") && /* @__PURE__ */ import_react19.default.createElement("button", { disabled: !snapshot.capabilities.asrConfigured || busy, onClick: () => run(async () => {
    const r = await fetch(API3 + "/audio?id=" + a.id);
    if (!r.ok) throw Error("\u539F\u59CB\u6587\u4EF6\u65E0\u6CD5\u8BFB\u53D6");
    const text = await transcribe(await r.blob(), a.name.split(".").at(-1));
    if (!text.trim()) throw Error("\u672C\u6B21\u672A\u8BC6\u522B\u51FA\u9010\u5B57\u7A3F\uFF0C\u539F\u5F55\u97F3\u548C\u5DF2\u6709\u9010\u5B57\u7A3F\u4FDD\u6301\u4E0D\u53D8");
    await updateMeeting(m.id, (x) => {
      x.transcript = parseTranscript(text);
      x.summaryDiagram = null;
      delete x.speakerStatus;
      delete x.speakerTranscript;
      delete x.speakerAutoAttempted;
      x.decisions = x.decisions.map((v) => ({ ...v, ref: null }));
      x.tasks = x.tasks.map((v) => ({ ...v, ref: null }));
      x.status = "\u5F85\u6574\u7406";
    });
    if (!m.summary) await organizeMeeting(m.id);
  }) }, "\u751F\u6210\u9010\u5B57\u7A3F"))), playURL && /* @__PURE__ */ import_react19.default.createElement("audio", { controls: true, src: playURL })))), detailTab !== "full" && /* @__PURE__ */ import_react19.default.createElement("aside", { className: "mw-card mw-source" }, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-card-head" }, /* @__PURE__ */ import_react19.default.createElement("h2", null, "\u539F\u6587\u6EAF\u6E90"), /* @__PURE__ */ import_react19.default.createElement("small", null, timeline.length, " \u6BB5")), /* @__PURE__ */ import_react19.default.createElement("input", { key: m.id, "aria-label": "\u539F\u6587\u5173\u952E\u8BCD\u5B9A\u4F4D", placeholder: "\u8F93\u5165\u5173\u952E\u8BCD\u5B9A\u4F4D\u539F\u6587\u2026", onChange: (e) => {
    const query = e.target.value.trim().toLowerCase();
    setHighlight(null);
    setSourceHit(query ? timeline.find((row) => row.text.toLowerCase().includes(query))?.id || "" : "");
  } }), savedExcerpt && /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-source-citation" }, /* @__PURE__ */ import_react19.default.createElement("p", { className: "small muted" }, "\u5F15\u7528\u65F6\u7684\u539F\u6587"), /* @__PURE__ */ import_react19.default.createElement(TranscriptRows, { rows: [savedExcerpt], activeId: activeSource, onAnchor: sourceAnchor })), /* @__PURE__ */ import_react19.default.createElement(TranscriptRows, { rows: timeline, activeId: activeSource, onAnchor: sourceAnchor })))), tab === "prepare" && /* @__PURE__ */ import_react19.default.createElement(MeetingPreparation, { data, busy, recording: !!recording, api: request, refresh, commit, run, start: startPlan, createRequested: createPlan, onCreateOpened: () => setCreatePlan(false), onDeleted: setDeletedPlan }), tab === "tasks" && /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-heading" }, /* @__PURE__ */ import_react19.default.createElement("div", null, /* @__PURE__ */ import_react19.default.createElement("h1", null, "\u4EFB\u52A1\u5B89\u6392")), /* @__PURE__ */ import_react19.default.createElement("button", { className: "primary", onClick: addTask }, "\u65B0\u5EFA\u4EFB\u52A1")), /* @__PURE__ */ import_react19.default.createElement(
    TaskFilters,
    {
      projects: data.projects,
      people: taskPeople,
      filter: taskFilter,
      project: taskProject,
      owner,
      due: taskDue,
      sort,
      onFilter: setTaskFilter,
      onProject: setTaskProject,
      onOwner: setOwner,
      onDue: setTaskDue,
      onSort: setSort,
      onReset: resetTaskFilters
    }
  ), /* @__PURE__ */ import_react19.default.createElement("section", { className: "mw-card" }, taskRows(tasks, true))))), /* @__PURE__ */ import_react19.default.createElement(
    AssistantPanel,
    {
      open: conversationOpen,
      onClose: hideAssistant,
      data,
      scope: assistantScope,
      sessionId: chatSession,
      opening: assistantOpening,
      ready: snapshot.ready,
      available: snapshot.capabilities.assistantAvailable,
      conversation,
      onScope: (scope) => openAssistant(false, scope),
      onHistory: (item) => openAssistant(false, item.scope, item.id),
      onNew: () => openAssistant(true),
      onChooseLocation: chooseLocation,
      sources: assistantSources,
      onSource: openAssistantSource
    }
  )), planToManage && /* @__PURE__ */ import_react19.default.createElement(MeetingPlanEditor, { key: planToManage.id, plan: planToManage, data, commit, onClose: () => setPlanToManage(null), onDeleted: setDeletedPlan }), modal && /* @__PURE__ */ import_react19.default.createElement(Modal, { error: modal === "import" ? error : "", title: { settings: "\u8BBE\u7F6E", exportMinutes: "\u5BFC\u51FA\u7EAA\u8981", projects: "\u9879\u76EE\u7BA1\u7406", project: draft.id ? "\u7F16\u8F91\u9879\u76EE" : "\u65B0\u5EFA\u9879\u76EE", meeting: "\u7F16\u8F91\u4F1A\u8BAE", import: "\u5BFC\u5165\u4F1A\u8BAE", record: "\u5F00\u59CB\u8BB0\u5F55", task: "\u884C\u52A8\u4E8B\u9879", transcript: "\u7F16\u8F91\u9010\u5B57\u7A3F", deleteMeeting: "\u5220\u9664\u4F1A\u8BAE", deleteMeetings: "\u6279\u91CF\u5220\u9664\u4F1A\u8BAE", deleteTask: "\u5220\u9664\u4EFB\u52A1", restore: "\u6062\u590D\u5907\u4EFD" }[modal], busy, onClose: () => setModal(null), onSave: ["settings", "projects", "exportMinutes"].includes(modal) || modal === "import" && draft.importMode === "minutes" && !draft.minutesPreview ? void 0 : ["deleteMeeting", "deleteMeetings", "deleteTask", "restore"].includes(modal) ? () => run(async () => {
    if (modal === "deleteMeeting") {
      await commit((d) => removeMeetings(d, [selected], protectedIds()));
      setSelected("");
    }
    if (modal === "deleteMeetings") {
      await commit((d) => removeMeetings(d, draft.ids, protectedIds()));
      setPicked([]);
      setNotice(`\u5DF2\u5220\u9664 ${draft.ids.length} \u573A\u4F1A\u8BAE\u53CA\u5173\u8054\u884C\u52A8\u4E8B\u9879\uFF0C\u539F\u59CB\u5F55\u97F3\u4FDD\u7559\u5728\u8D44\u6599\u76EE\u5F55`);
    }
    if (modal === "deleteTask") await updateMeeting(draft.meetingId || selected, (x) => x.tasks = x.tasks.filter((t) => t.id !== draft.id));
    if (modal === "restore") {
      validateData(draft.backup);
      await commit((d) => Object.assign(d, draft.backup));
      setSelected("");
    }
    ;
    setModal(null);
  }) : saveModal, saveLabel: modal === "import" && draft.importMode === "minutes" ? "\u5BFC\u5165\u5999\u8BB0" : modal === "record" ? draft.live === false ? "\u5F00\u59CB\u4EC5\u5F55\u97F3" : "\u5F00\u59CB\u5F55\u97F3\u5E76\u8F6C\u5199" : ["deleteMeeting", "deleteMeetings", "deleteTask"].includes(modal) ? "\u786E\u8BA4\u5220\u9664" : modal === "restore" ? "\u66FF\u6362\u6587\u672C\u8D44\u6599" : "\u4FDD\u5B58" }, modal === "exportMinutes" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("p", { className: "muted" }, "\u9009\u62E9\u6587\u4EF6\u683C\u5F0F"), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-minutes-formats" }, [["docx", "Word\uFF08.docx\uFF09"], ["txt", "\u7EAF\u6587\u672C\uFF08.txt\uFF09"], ["md", "Markdown\uFF08.md\uFF09"]].map(([format, label]) => /* @__PURE__ */ import_react19.default.createElement("button", { key: format, type: "button", onClick: () => run(() => exportMinutes(format)) }, label)))) : modal === "settings" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement(MeetingDetectionSettings, { api: request, ready: snapshot.ready, projects: data.projects, status: snapshot.meetingDetection, onSaved: refresh }), /* @__PURE__ */ import_react19.default.createElement(StorageManagement, { api: request, onSaved: refresh, ready: snapshot.ready, recording, location: snapshot.location }), /* @__PURE__ */ import_react19.default.createElement(SpeechConfiguration, { api: request, disabled: !!recording, activeModel: recording?.live ? recState.asrModel || recording?.asrModel : void 0, onSaved: refresh }), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-setting" }, /* @__PURE__ */ import_react19.default.createElement("b", null, "\u8D44\u6599\u4F4D\u7F6E"), /* @__PURE__ */ import_react19.default.createElement("p", null, snapshot.location || "\u5C1A\u672A\u9009\u62E9"), /* @__PURE__ */ import_react19.default.createElement("button", { disabled: !!recording, onClick: chooseLocation }, "\u9009\u62E9\u6216\u66F4\u6362\u8D44\u6599\u6587\u4EF6\u5939"), " ", /* @__PURE__ */ import_react19.default.createElement("button", { disabled: !!recording, onClick: () => run(refresh) }, "\u91CD\u65B0\u8BFB\u53D6\u8D44\u6599")), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-setting" }, /* @__PURE__ */ import_react19.default.createElement("b", null, "AI \u6A21\u578B"), /* @__PURE__ */ import_react19.default.createElement("p", null, snapshot.capabilities.aiModel || "\u5C1A\u672A\u5728 DSH \u9009\u62E9\u6A21\u578B"), /* @__PURE__ */ import_react19.default.createElement("b", null, "\u97F3\u9891\u91C7\u96C6"), /* @__PURE__ */ import_react19.default.createElement("p", null, snapshot.capabilities.systemAudio ? "\u7535\u8111\u58F0\u97F3\uFF0B\u9EA6\u514B\u98CE / \u4EC5\u9EA6\u514B\u98CE" : "\u4EC5\u9EA6\u514B\u98CE\uFF1B\u53CC\u8DEF\u91C7\u96C6\u7EC4\u4EF6\u672A\u52A0\u8F7D"), /* @__PURE__ */ import_react19.default.createElement("p", { className: "small muted" }, "\u5DE5\u4F5C\u53F0\u7248\u672C\uFF1A0.16.1 \xB7 \u670D\u52A1\uFF1A", snapshot.serviceVersion || "\u5F85\u786E\u8BA4")), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-setting" }, /* @__PURE__ */ import_react19.default.createElement("b", null, "\u6570\u636E\u5907\u4EFD"), /* @__PURE__ */ import_react19.default.createElement("p", { className: "small muted" }, "JSON \u5907\u4EFD\u5305\u62EC\u4F1A\u8BAE\u3001\u9010\u5B57\u7A3F\u3001\u4EFB\u52A1\u548C\u97F3\u9891\u7D22\u5F15\u3002\u8BF7\u53E6\u5916\u5907\u4EFD\u8D44\u6599\u76EE\u5F55\u91CC\u7684 audio \u6587\u4EF6\u5939\u3002\u6062\u590D\u4F1A\u66FF\u6362\u6587\u672C\u8D44\u6599\uFF1B\u4E0D\u4F1A\u5220\u9664\u78C1\u76D8\u4E0A\u7684\u5F55\u97F3\u6587\u4EF6\u3002"), /* @__PURE__ */ import_react19.default.createElement("div", { className: "actions" }, /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => download(JSON.stringify(data, null, 2), "\u4F1A\u8BAE\u5DE5\u4F5C\u53F0-\u5907\u4EFD.json") }, "\u5BFC\u51FA\u5168\u90E8\u6587\u672C\u8D44\u6599"), /* @__PURE__ */ import_react19.default.createElement("label", { className: "mw-file-button" }, "\u6062\u590D\u5907\u4EFD", /* @__PURE__ */ import_react19.default.createElement("input", { type: "file", accept: ".json", onChange: (e) => run(async () => {
    const f = e.target.files[0];
    if (!f) return;
    if (!snapshot.ready) throw Error("\u8BF7\u5148\u9009\u62E9\u8D44\u6599\u6587\u4EF6\u5939");
    const backup = JSON.parse(await f.text());
    validateData(backup);
    openModal("restore", { backup });
  }) })))), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-setting" }, /* @__PURE__ */ import_react19.default.createElement("b", null, "\u793A\u4F8B\u6570\u636E"), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => run(() => commit((d) => d.meetings = d.meetings.filter((m2) => m2.source !== "\u793A\u4F8B"))) }, "\u6E05\u7406\u793A\u4F8B\u4F1A\u8BAE"))) : modal === "projects" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-setting" }, data.projects.map((p) => /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-project", key: p.id }, /* @__PURE__ */ import_react19.default.createElement("span", null, p.name), /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => openModal("project", p) }, "\u7F16\u8F91"), p.id !== "default" && /* @__PURE__ */ import_react19.default.createElement("button", { onClick: () => run(() => commit((d) => removeProject(d, p.id))) }, "\u5220\u9664\u5E76\u79FB\u81F3\u672A\u5206\u7C7B"))), /* @__PURE__ */ import_react19.default.createElement("button", { disabled: !snapshot.ready, onClick: () => openModal("project", { name: "" }) }, "\u65B0\u5EFA\u9879\u76EE"))) : modal === "project" ? /* @__PURE__ */ import_react19.default.createElement("label", null, "\u9879\u76EE\u540D\u79F0", field("name", { required: true, maxLength: 100 })) : modal === "deleteMeetings" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("p", null, "\u5C06\u5220\u9664\u6240\u9009 ", draft.ids.length, " \u573A\u4F1A\u8BAE\u53CA\u5176 ", data.meetings.filter((x) => draft.ids.includes(x.id)).reduce((n, x) => n + x.tasks.length, 0), " \u9879\u884C\u52A8\u4E8B\u9879\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0C\u78C1\u76D8\u4E0A\u7684\u539F\u59CB\u5F55\u97F3\u4F1A\u4FDD\u7559\u3002"), /* @__PURE__ */ import_react19.default.createElement("ul", { className: "mw-delete-list" }, data.meetings.filter((x) => draft.ids.includes(x.id)).map((x) => /* @__PURE__ */ import_react19.default.createElement("li", { key: x.id }, x.title))), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", onClick: () => download(JSON.stringify(data, null, 2), "\u4F1A\u8BAE\u5DE5\u4F5C\u53F0-\u5220\u9664\u524D\u5907\u4EFD.json") }, "\u5BFC\u51FA\u5220\u9664\u524D\u5907\u4EFD")) : ["deleteMeeting", "deleteTask", "restore"].includes(modal) ? /* @__PURE__ */ import_react19.default.createElement("p", null, "\u6B64\u64CD\u4F5C\u4F1A", modal === "restore" ? "\u66FF\u6362\u5F53\u524D\u6587\u672C\u8D44\u6599\uFF0C\u8BF7\u5148\u5BFC\u51FA\u5907\u4EFD" : "\u5220\u9664\u6240\u9009\u8BB0\u5F55", "\u3002\u8BF7\u786E\u8BA4\u540E\u7EE7\u7EED\u3002\u78C1\u76D8\u4E0A\u7684\u539F\u59CB\u5F55\u97F3\u4E0D\u4F1A\u88AB\u81EA\u52A8\u5220\u9664\u3002") : modal === "task" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("label", null, "\u4EFB\u52A1\u5185\u5BB9", field("title", { required: true, maxLength: 1e3 })), /* @__PURE__ */ import_react19.default.createElement("label", null, "\u6765\u6E90\u4F1A\u8BAE", /* @__PURE__ */ import_react19.default.createElement("select", { "aria-label": "\u6765\u6E90\u4F1A\u8BAE", value: draft.meetingId, disabled: !!draft.id, onChange: (e) => setDraft({ ...draft, meetingId: e.target.value, project: data.meetings.find((m2) => m2.id === e.target.value)?.project || "default", ref: "" }) }, data.meetings.map((x) => /* @__PURE__ */ import_react19.default.createElement("option", { key: x.id, value: x.id }, x.title)))), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-fields" }, /* @__PURE__ */ import_react19.default.createElement("label", null, "\u8D1F\u8D23\u4EBA", /* @__PURE__ */ import_react19.default.createElement(PeoplePicker, { value: draft.owners || [], people: peopleFor(data, { assignableOnly: true }), archived: data.archivedTaskPeople, onRosterChange: editPeopleRoster, label: "\u4EFB\u52A1\u8D1F\u8D23\u4EBA", onSave: async (owners) => setDraft((d) => ({ ...d, owners })) })), /* @__PURE__ */ import_react19.default.createElement("label", null, "\u622A\u6B62\u65E5\u671F", field("due", { type: "date" }))), /* @__PURE__ */ import_react19.default.createElement("label", null, "\u9879\u76EE", /* @__PURE__ */ import_react19.default.createElement("select", { "aria-label": "\u65B0\u4EFB\u52A1\u9879\u76EE", value: draft.project || "default", onChange: (e) => setDraft({ ...draft, project: e.target.value }) }, data.projects.map((p) => /* @__PURE__ */ import_react19.default.createElement("option", { key: p.id, value: p.id }, p.name)))), /* @__PURE__ */ import_react19.default.createElement("label", null, "\u539F\u6587\u6BB5\u843D", /* @__PURE__ */ import_react19.default.createElement("select", { value: draft.ref ?? "", onChange: (e) => setDraft({ ...draft, ref: e.target.value }) }, /* @__PURE__ */ import_react19.default.createElement("option", { value: "" }, "\u5F85\u6838\u5BF9\uFF0C\u4E0D\u5173\u8054"), data.meetings.find((x) => x.id === draft.meetingId)?.transcript.map((r, i) => /* @__PURE__ */ import_react19.default.createElement("option", { key: r.id, value: i }, r.time, " \xB7 ", r.text.slice(0, 45))))), /* @__PURE__ */ import_react19.default.createElement("label", { className: "inline" }, /* @__PURE__ */ import_react19.default.createElement("input", { type: "checkbox", checked: !!draft.done, onChange: (e) => setDraft({ ...draft, done: e.target.checked }) }), "\u5DF2\u5B8C\u6210")) : modal === "import" && draft.importMode === "minutes" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-import-modes actions", "aria-label": "\u5BFC\u5165\u6765\u6E90" }, /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", disabled: busy, onClick: () => setDraft((value) => ({ ...value, importMode: "file" })) }, "\u6587\u4EF6\u6216\u6587\u5B57"), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", className: "active", "aria-pressed": "true" }, "\u98DE\u4E66\u5999\u8BB0\u94FE\u63A5")), /* @__PURE__ */ import_react19.default.createElement(FeishuMinutesImport, { draft, setDraft, api: request, run, busy, projectSelect })) : modal === "transcript" ? /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("p", { className: "small muted" }, m?.speakerTranscript?.length ? "\u7F16\u8F91\u5F53\u524D\u663E\u793A\u7684\u9010\u5B57\u7A3F\u3002\u5DF2\u6709\u7EAA\u8981\u5F15\u7528\u4ECD\u53EF\u67E5\u770B\u5F15\u7528\u65F6\u7684\u539F\u6587\u3002" : "\u4FEE\u6539\u539F\u6587\u4F1A\u89E3\u9664\u5DF2\u6709\u51B3\u7B56\u548C\u4EFB\u52A1\u7684\u6BB5\u843D\u5F15\u7528\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u3002"), /* @__PURE__ */ import_react19.default.createElement("textarea", { className: "large", value: draft.text, onChange: (e) => setDraft({ ...draft, text: e.target.value }) })) : /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, modal === "import" && /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-import-modes actions", "aria-label": "\u5BFC\u5165\u6765\u6E90" }, /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", className: "active", "aria-pressed": "true" }, "\u6587\u4EF6\u6216\u6587\u5B57"), /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", disabled: busy, onClick: () => setDraft((value) => ({ ...value, importMode: "minutes" })) }, "\u98DE\u4E66\u5999\u8BB0\u94FE\u63A5")), /* @__PURE__ */ import_react19.default.createElement("label", null, "\u4F1A\u8BAE\u540D\u79F0", field("title", { required: modal !== "record", maxLength: 200, placeholder: modal === "record" ? "\u4F1A\u8BAE\u7ED3\u675F\u540E\u81EA\u52A8\u751F\u6210\uFF08\u53EF\u9009\u586B\uFF09" : "" })), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mw-fields" }, /* @__PURE__ */ import_react19.default.createElement("label", null, "\u6240\u5C5E\u9879\u76EE", projectSelect(draft.project, (v) => setDraft((d) => ({ ...d, project: v })))), modal !== "record" && /* @__PURE__ */ import_react19.default.createElement("label", null, "\u4F1A\u8BAE\u65E5\u671F", field("date", { type: "date", required: true }))), modal === "meeting" && /* @__PURE__ */ import_react19.default.createElement("label", null, "\u53C2\u4E0E\u8005", field("participants", { placeholder: "\u7528\u987F\u53F7\u6216\u9017\u53F7\u5206\u9694" })), modal === "import" && /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("label", { className: "mw-upload" }, "\u9009\u62E9\u6587\u4EF6", /* @__PURE__ */ import_react19.default.createElement("input", { "aria-label": "\u4E0A\u4F20\u9010\u5B57\u7A3F\u6216\u97F3\u89C6\u9891", type: "file", accept: ".txt,.md,.srt,.vtt,audio/*,video/*", onChange: (e) => run(() => importFile(e.target.files[0])) }), /* @__PURE__ */ import_react19.default.createElement("small", null, "\u652F\u6301 TXT / Markdown / SRT / VTT \u4E0E\u97F3\u89C6\u9891\uFF0C\u6700\u5927 25 MB")), draft.file && /* @__PURE__ */ import_react19.default.createElement("p", null, "\u5DF2\u9009\u62E9\uFF1A", draft.file.name), /* @__PURE__ */ import_react19.default.createElement("label", null, "\u6216\u7C98\u8D34\u9010\u5B57\u7A3F", /* @__PURE__ */ import_react19.default.createElement("textarea", { "aria-label": "\u9010\u5B57\u7A3F\u5185\u5BB9", value: draft.text, onChange: (e) => setDraft({ ...draft, text: e.target.value }), placeholder: "00:12 \u9648\u5B87\uFF1A\u8BA8\u8BBA\u5185\u5BB9\u2026" }))), modal === "record" && /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement("label", null, "\u91C7\u96C6\u65B9\u5F0F", /* @__PURE__ */ import_react19.default.createElement("select", { "aria-label": "\u91C7\u96C6\u65B9\u5F0F", value: draft.captureMode || "microphone", onChange: (e) => setDraft({ ...draft, captureMode: e.target.value }) }, /* @__PURE__ */ import_react19.default.createElement("option", { value: "system-microphone", disabled: !snapshot.capabilities.systemAudio }, "\u7535\u8111\u58F0\u97F3\uFF0B\u9EA6\u514B\u98CE\uFF08\u817E\u8BAF\u4F1A\u8BAE / \u98DE\u4E66\uFF09"), /* @__PURE__ */ import_react19.default.createElement("option", { value: "microphone" }, "\u4EC5\u9EA6\u514B\u98CE"))), draft.captureMode === "system-microphone" && /* @__PURE__ */ import_react19.default.createElement("p", { className: "small muted" }, "\u4F7F\u7528\u7CFB\u7EDF\u9ED8\u8BA4\u9EA6\u514B\u98CE\u3002\u9996\u6B21\u4F7F\u7528\u9700\u5141\u8BB8\u9EA6\u514B\u98CE\u548C\u5C4F\u5E55\u5F55\u5236\u6743\u9650\uFF1B\u5C4F\u5E55\u753B\u9762\u4E0D\u4F1A\u4FDD\u5B58\u3002\u5EFA\u8BAE\u4F69\u6234\u8033\u673A\u3002"), /* @__PURE__ */ import_react19.default.createElement("label", null, "\u8F6C\u5199\u8BED\u8A00", /* @__PURE__ */ import_react19.default.createElement("select", { value: snapshot.capabilities.transcription?.selected === "x-asr" ? "auto" : draft.language, disabled: snapshot.capabilities.transcription?.selected === "x-asr" || draft.live === false, onChange: (e) => setDraft({ ...draft, language: e.target.value }) }, /* @__PURE__ */ import_react19.default.createElement("option", { value: "auto" }, "\u81EA\u52A8\u8BC6\u522B\uFF08\u4E2D\u82F1\u6DF7\u5408\uFF09"), /* @__PURE__ */ import_react19.default.createElement("option", { value: "zh" }, "\u4E2D\u6587"), /* @__PURE__ */ import_react19.default.createElement("option", { value: "en" }, "English"))), /* @__PURE__ */ import_react19.default.createElement("label", { className: "inline" }, /* @__PURE__ */ import_react19.default.createElement("input", { type: "checkbox", checked: draft.live !== false, onChange: (e) => setDraft({ ...draft, live: e.target.checked }) }), "\u540C\u6B65\u8F6C\u5199"), draft.live !== false && /* @__PURE__ */ import_react19.default.createElement(RecordingModelInfo, { catalog: snapshot.capabilities.transcription, busy, prepare: prepareSpeech })))));
}
function apply(ctx) {
  const service = workbenchService(ctx);
  ctx.effect(() => ctx.desktopWorkbenches.register({ title: "\u4F1A\u8BAE\u7EAA\u8981\u5DE5\u4F5C\u53F0", repository: "https://github.com/mehrocc/dsh-meeting-workspace", description: "\u91C7\u96C6\u4F1A\u8BAE\u3001\u6838\u5BF9\u7EAA\u8981\u3001\u8DDF\u8FDB\u884C\u52A8\u4E0E\u68C0\u7D22\u5386\u53F2", customFrame: true, headerLayout: "default" }, (props) => /* @__PURE__ */ import_react19.default.createElement(MeetingWorkspace, { ...props, service, host: { pickDirectory: () => ctx.uiWorkspace.pickDirectory() } })));
}
var inject = ["desktopWorkbenches", "uiWorkspace", "sessions", "conversation"];

return module.exports;}});
