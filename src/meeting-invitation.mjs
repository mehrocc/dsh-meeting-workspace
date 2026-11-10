const datePattern = /\b(\d{4})(?:年|[./-])\s*(\d{1,2})(?:月|[./-])\s*(\d{1,2})(?!\d)(?:日|号)?/;
const timePattern = /(?:^|[^\d])(?:(上午|下午|中午|晚上|凌晨)\s*)?(\d{1,2}):(\d{2})(?!\d)(?:\s*(AM|PM)\b)?/i;
const zonePattern = /(?:GMT|UTC)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?|\b(?:GMT|UTC)\b(?!\s*[+-])|中国标准时间|北京时间|China Standard Time|Beijing Time/i;
const timeLabel = /^(?:会议时间|开始时间|日程时间|时间|meeting time|start time|time)\s*:\s*/i;
const dateLabel = /^(?:会议日期|开始日期|日期|meeting date|date)\s*:\s*/i;
const meetingHosts = new Set(['vc.feishu.cn', 'vc.larksuite.com', 'meeting.tencent.com', 'meeting.qq.com', 'wemeet.tencent.com']);
const twoDigits = number => String(number).padStart(2, '0');

function calendarDate(value) {
  const match = value.match(datePattern);
  if (!match) return '';
  const [, year, month, day] = match;
  const date = `${year}-${twoDigits(month)}-${twoDigits(day)}`;
  const parsed = new Date(date + 'T00:00:00Z');
  return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === date ? date : '';
}

function clockTime(value) {
  const match = value.match(timePattern);
  if (!match) return '';
  const [, chinese, hours, minutes, english] = match;
  let hour = Number(hours);
  if (hour > 23 || Number(minutes) > 59) return '';
  if (english) {
    if (hour < 1 || hour > 12) return '';
    hour = hour % 12 + (english.toUpperCase() === 'PM' ? 12 : 0);
  } else if (['下午', '中午', '晚上'].includes(chinese) && hour < 12) {
    hour += 12;
  } else if (chinese === '凌晨' && hour === 12) {
    hour = 0;
  }
  return `${twoDigits(hour)}:${minutes}`;
}

function meetingLink(value) {
  const urls = value.match(/https?:\/\/[^\s<>"'，。；）】]+/gi) || [];
  for (const candidate of urls) {
    try {
      const url = new URL(candidate.replace(/[),.;\]}>]+$/, ''));
      if (meetingHosts.has(url.hostname) && url.pathname !== '/' && !url.username && !url.password) return url.href;
    } catch {}
  }
  return '';
}

export function parseMeetingInvitation(invitation) {
  const originalLines = invitation.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const title = originalLines.map(line => line.match(/^(?:会议主题|会议名称|会议标题|日程标题|日程名称|主题|标题|meeting topic|meeting title|subject|topic)\s*[:：]\s*(.+)$/i)?.[1]
    || line.match(/邀请(?:你|您)参加(?:飞书|腾讯)?(?:视频)?会议\s*[:：]\s*(.+)$/)?.[1]).find(Boolean) || '';
  const lines = originalLines.map(line => line.replace(/[：＋－／０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0)));
  const dateLine = lines.find(line => dateLabel.test(line)) || '';
  const startLine = lines.find(line => /^(?:开始时间|start time)\s*:/i.test(line))
    || lines.find(line => timeLabel.test(line))
    || lines.find(line => line.search(datePattern) === 0)
    || '';
  const labelIndex = lines.indexOf(startLine);
  const timeLine = timeLabel.test(startLine) && !startLine.replace(timeLabel, '').trim()
    ? lines[labelIndex + 1] || ''
    : startLine;
  let date = calendarDate(timeLine) || calendarDate(dateLine);
  const zone = timeLine.match(zonePattern) || lines.find(line => /^(?:时区|time zone)\s*:/i.test(line))?.match(zonePattern);
  let time = clockTime(timeLine.replace(zonePattern, ''));
  if (time && zone) {
    const [, sign, hours, minutes] = zone;
    const offset = sign ? Number(hours) * 60 + Number(minutes || 0) : /GMT|UTC/i.test(zone[0]) ? 0 : 480;
    if (!date || offset > 14 * 60 || Number(minutes || 0) > 59) {
      time = '';
    } else {
      const local = new Date(Date.parse(`${date}T${time}:00Z`) - offset * (sign === '-' ? -1 : 1) * 60000);
      date = `${local.getFullYear()}-${twoDigits(local.getMonth() + 1)}-${twoDigits(local.getDate())}`;
      time = `${twoDigits(local.getHours())}:${twoDigits(local.getMinutes())}`;
    }
  }
  return {title: title.slice(0, 200), date, time, link: meetingLink(invitation)};
}
