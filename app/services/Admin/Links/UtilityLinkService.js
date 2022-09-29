const ogs = require("open-graph-scraper");

const rules = {
  resolve: { destination: "required|url" },
  suggest: {
    minLength: "required|integer",
    maxLength: "required|integer",
  },
};

const resolve = async destination => {
  try {
    const data = await ogs({ url: destination, timeout: 3000 });
    const { result } = data;

    const { ogTitle, ogDescription, favicon } = result;
    let realIcon = favicon;

    if (typeof favicon !== "undefined" && !/^http/.test(favicon)) {
      const siteParts = destination.replace(/\/$/, "").split("/");
      realIcon = `${siteParts[0]}//${siteParts[2]}${favicon}`;
    }

    return {
      title: ogTitle,
      description: ogDescription.replace(/\n/g, " ").replace(/^\s|\s$/g, ""),
      icon: realIcon ? realIcon : "",
    };
  } catch (err) {
    return { title: null, description: null, icon: null };
  }
};

const suggest = query => {
  const { minLength, maxLength } = query;

  let realLength = 0;

  const rand = Math.random();
  if (rand < 0.5) {
    realLength = parseInt(minLength);
  } else {
    realLength = parseInt(maxLength);
  }

  let output = "";
  const alphaNum =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < realLength; i++) {
    output += alphaNum.charAt(Math.floor(Math.random() * alphaNum.length));
  }

  return {
    minLength,
    maxLength,
    output,
  };
};

module.exports = {
  rules,
  resolve,
  suggest,
};
