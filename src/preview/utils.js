function createElement(type, attributes, ...c) {
  const children = c.flat();
  return `<${type} ${
    attributes
      ? Object.entries(attributes)
          .map(([attr, value]) => `${attr}="${value}"`)
          .join(" ")
      : ""
  }>${
    Array.isArray(children)
      ? children.filter(item => item !== null).join("")
      : children || ""
  }</${type}>`;
}

module.exports = {
  createElement
};