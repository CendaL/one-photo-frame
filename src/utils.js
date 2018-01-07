export function baseName(name) {
  if (typeof name === "string") {
    var base = name.substring(name.lastIndexOf("/") + 1);
    if (base.lastIndexOf(".") != -1) {
      base = base.substring(0, base.lastIndexOf("."));
    }
    return base;
  }
}

export function isVideo(name) {
  if (typeof name === "string") {
    return name.toLowerCase().search(".mp4$") !== -1;
  }
}
