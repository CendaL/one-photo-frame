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
  // datetime is string "2016-08-14T19:20:40Z" so we must use UTC variant to not convert it to local timezone
  const dt = new Date(datetime);
  let minutes = dt.getUTCMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${dt.getUTCDate()}. ${dt.getUTCMonth() + 1}. ${dt.getUTCFullYear()} ${dt.getUTCHours()}:${minutes}`;
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
  text = `${new Date().toISOString()} ${text}`;
  console.log(text);
  const log_element = document.querySelector("pre.log");
  if (log_element) {
    log_element.textContent = `${text}\n\n` + log_element.textContent;
  }
}

export function logError(text) {
  const log_element = document.querySelector("pre.logError");
  if (log_element) {
    log_element.textContent = `${text}\n\n` + log_element.textContent;
  }
  log(text);
}

export function fetchRetry(url, options) {
  var retries = 3;
  var retryDelay = 3000;

  return new Promise(function(resolve, reject) {
    var wrappedFetch = function(n) {
      fetch(url, options)
        .then(resolve)
        .catch(error => {
          if (n > 0) {
            retry(n);
          } else {
            reject(error);
          }
        });
    };

    function retry(n) {
      setTimeout(function() {
        wrappedFetch(--n);
      }, retryDelay);
    }

    wrappedFetch(retries);
  });
}
