export function baseName(name) {
  if (typeof name === "string") {
    var base = name.substring(name.lastIndexOf("/") + 1);
    if (base.lastIndexOf(".") != -1) {
      base = base.substring(0, base.lastIndexOf("."));
    }
    return base;
  }
}

export function formatDateTime(datetime) {
  const dt = new Date(datetime);
  let minutes = dt.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${dt.getDate()}. ${dt.getMonth() + 1}. ${dt.getFullYear()} ${dt.getHours()}:${minutes}`;
}

export function getDriveId(itemId) {
  return itemId.match(/(.*)[!]/)[1];
}

export function isVideo(name) {
  if (typeof name === "string") {
    return name.toLowerCase().search(".mp4$") !== -1;
  }
}

export function log(text) {
  const log_element = document.querySelector("pre.log");
  if (log_element) {
    log_element.textContent = `${text}\n\n` + log_element.textContent;
  }
  console.log(text);
}
