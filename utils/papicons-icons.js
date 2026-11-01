// Auto-generated from @getpapillon/papicons v0.2.3 (icons-web)
import { h } from 'vue'

const SVG_ATTR_MAP = {
  fillRule: 'fill-rule',
  clipRule: 'clip-rule',
  strokeWidth: 'stroke-width',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeDasharray: 'stroke-dasharray',
  strokeDashoffset: 'stroke-dashoffset',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  fillOpacity: 'fill-opacity',
  strokeOpacity: 'stroke-opacity'
}

function _jsx(type, props) {
  if (!props) return typeof type === 'function' ? type({}) : h(type)
  const { children, ...rest } = props
  const normalized = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined) continue
    normalized[SVG_ATTR_MAP[k] || k] = v
  }
  if (typeof type === 'function') {
    return type(props)
  }
  const childArray =
    children == null ? [] : Array.isArray(children) ? children : [children]
  return h(type, normalized, childArray)
}

const _jsxs = _jsx

export const Accessibility = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M15 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.97 20.058a1.342 1.342 0 0 0 2.4 1.2l1.183-2.364a1.618 1.618 0 0 1 2.894 0l1.182 2.364a1.342 1.342 0 0 0 2.4-1.2l-2.346-4.691a.944.944 0 0 1 1.6-.99l1.32 1.76a1.324 1.324 0 0 0 2.194-1.475l-1.51-2.518c-.745-1.24-2.274-1.76-3.689-1.454-.802.173-1.717.31-2.598.31s-1.796-.137-2.598-.31c-1.415-.305-2.944.214-3.689 1.454l-1.51 2.518a1.324 1.324 0 0 0 2.194 1.475l1.32-1.76a.944.944 0 0 1 1.6.99z"
  })
});

export const Add = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M20.414 10.515c.375.374.586.916.586 1.485s-.21 1.112-.585 1.486a1.8 1.8 0 0 1-1.415.515l-.35-.025-5.035-.36.36 5.035.026.349c.038.53-.14 1.04-.515 1.415-.374.375-.917.585-1.486.585s-1.111-.211-1.485-.586A1.79 1.79 0 0 1 10 19.001l.026-.35.36-5.036-5.037.36L5 14a1.79 1.79 0 0 1-1.413-.515C3.21 13.111 3 12.57 3 12s.21-1.112.585-1.486A1.8 1.8 0 0 1 5 10l.35.024 5.034.36L10 5c-.039-.53.138-1.04.514-1.415C10.888 3.21 11.431 3 12 3s1.111.211 1.485.586c.376.375.553.883.515 1.413l-.026.35-.359 5.036 5.036-.36L19 10a1.79 1.79 0 0 1 1.413.515"
  })
});

export const Alert = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M11.953 15.826a2.087 2.087 0 1 1 0 4.174 2.087 2.087 0 0 1 0-4.174M11.954 4a2.624 2.624 0 0 1 2.522 3.345L12.84 13.07a.923.923 0 0 1-1.773 0L9.43 7.345A2.624 2.624 0 0 1 11.954 4"
  })
});

export const AlertCircle = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18m0 11.87a1.565 1.565 0 1 0 .002 3.13A1.565 1.565 0 0 0 12 14.87M12 6a1.968 1.968 0 0 0-1.892 2.508l1.227 4.295a.693.693 0 0 0 1.33 0l1.228-4.295A1.968 1.968 0 0 0 12 6",
    clipRule: "evenodd"
  })
});

export const AlertTriangle = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M10.946 3.121a2.5 2.5 0 0 1 2.108 0c.768.357 1.342 1.453 2.49 3.644l4.388 8.378c1.013 1.934 1.52 2.902 1.414 3.69a2.5 2.5 0 0 1-1.033 1.707c-.649.46-1.74.46-3.924.46H7.611c-2.183 0-3.275 0-3.924-.46a2.5 2.5 0 0 1-1.033-1.707c-.106-.788.401-1.756 1.414-3.69l4.389-8.378c1.147-2.191 1.721-3.287 2.489-3.644M12 15.869a1.566 1.566 0 1 0 0 3.132 1.566 1.566 0 0 0 0-3.132M12 7a1.968 1.968 0 0 0-1.893 2.509l1.227 4.295a.693.693 0 0 0 1.33 0l1.227-4.295A1.967 1.967 0 0 0 12.001 7",
    clipRule: "evenodd"
  })
});

export const Apple = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 10.188c4.97-2.845 9-.92 9 3.794s-4 10.433-9 6.639c-5 3.794-9-1.925-9-6.639s4.03-6.64 9-3.794M12.75 3.607c.528-.002 1.155.327 1.664.836.51.51.838 1.136.836 1.664.002.533-.326.924-.836 1.164l-.067.032-1.22.583-.067.032c-.27.127-.635.144-.973.087-.34-.06-.627-.188-.837-.398s-.338-.496-.398-.837c-.056-.338-.04-.703.088-.973l.032-.068.582-1.218.032-.068c.24-.51.631-.838 1.164-.836"
  })
});

export const Archive = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12.935 9.076c3.192-.1 4.79-.15 5.381.368.066.057.089.08.148.144.536.576.536 1.92.536 4.605 0 2.641 0 3.962-.774 4.819a3 3 0 0 1-.214.214c-.857.774-2.178.774-4.819.774h-2.386c-2.641 0-3.962 0-4.819-.774a3 3 0 0 1-.214-.214C5 18.155 5 16.834 5 14.193c0-2.686 0-4.03.536-4.605.06-.064.082-.087.148-.144.592-.517 2.189-.468 5.381-.368a30 30 0 0 0 1.87 0M12 12c-.713 0-1.275.017-1.695.037C9.668 12.068 9 12.363 9 13s.668.932 1.305.963c.42.02.982.037 1.695.037s1.275-.017 1.695-.037C14.332 13.932 15 13.637 15 13s-.668-.932-1.305-.963A35 35 0 0 0 12 12m6.65-8c.745 0 1.35.605 1.35 1.35 0 .663-.48 1.224-1.138 1.297C17.547 6.795 15.151 7 12 7c-3.15 0-5.546-.205-6.862-.353A1.29 1.29 0 0 1 4 5.351C4 4.605 4.605 4 5.35 4z"
  })
});

export const ArrowDown = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.424 13.06a1.5 1.5 0 0 0-2.12-2.121l-3.879 3.879.413-8.446.026-.508a1.85 1.85 0 0 0-.537-1.415 2.07 2.07 0 0 0-1.463-.585c-.557 0-1.089.21-1.463.585a1.85 1.85 0 0 0-.537 1.415l.025.508.4 8.16-3.592-3.593a1.5 1.5 0 0 0-2.121 2.121l6.363 6.364a1.5 1.5 0 0 0 2.122 0z"
  })
});

export const ArrowDownBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M21 12c0 1.483-.072 2.748-.178 3.805-.274 2.723-2.293 4.743-5.016 5.016a38 38 0 0 1-3.806.18c-1.483 0-2.748-.073-3.805-.18-2.723-.273-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.073-2.749.179-3.806.274-2.722 2.294-4.741 5.016-5.015A38 38 0 0 1 12 3c1.483 0 2.75.073 3.806.179 2.723.274 4.742 2.293 5.016 5.015C20.928 9.251 21 10.517 21 12m-4.122.828a1 1 0 1 0-1.414-1.414l-2.366 2.367.268-5.228.017-.322a1.23 1.23 0 0 0-.355-.944c-.25-.25-.606-.39-.978-.39s-.728.14-.978.39-.373.59-.355.944l.017.322.26 5.046-2.185-2.185a1 1 0 0 0-1.414 1.414l4.034 4.035c.39.39 1.024.39 1.415 0z",
    clipRule: "evenodd"
  })
});

export const ArrowLeft = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M10.804 4.44a1.5 1.5 0 1 1 2.12 2.12l-3.878 3.878 8.445-.413L18 10c.53-.027 1.04.162 1.415.537S20 11.443 20 12a2.07 2.07 0 0 1-.585 1.463A1.85 1.85 0 0 1 18 14l-.509-.025q-4.08-.201-8.16-.4l3.594 3.592a1.5 1.5 0 0 1-2.121 2.121l-6.365-6.363a1.5 1.5 0 0 1 0-2.122z"
  })
});

export const ArrowLeftBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c-1.483 0-2.748.073-3.805.179-2.722.274-4.742 2.293-5.016 5.015A38 38 0 0 0 3 12c0 1.483.073 2.748.179 3.805.274 2.723 2.293 4.743 5.016 5.016 1.057.107 2.322.18 3.805.18a38 38 0 0 0 3.806-.18c2.723-.274 4.742-2.293 5.016-5.016.106-1.057.178-2.322.178-3.805s-.072-2.749-.178-3.806c-.274-2.722-2.293-4.741-5.016-5.015A38 38 0 0 0 12 3m-.828 4.122a1 1 0 1 1 1.414 1.414l-2.367 2.367 5.228-.27.323-.016c.353-.018.693.106.943.356s.39.606.39.977c0 .372-.14.728-.39.978s-.59.374-.943.355l-.323-.016-5.045-.261 2.184 2.185a1 1 0 0 1-1.414 1.415L7.137 12.57a1 1 0 0 1 0-1.415z",
    clipRule: "evenodd"
  })
});

export const ArrowLeftDown = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M4.5 9a1.5 1.5 0 1 1 3 0v5.379l9.44-9.44a1.5 1.5 0 1 1 2.12 2.121L9.622 16.5h5.38a1.5 1.5 0 0 1 0 3H6A1.5 1.5 0 0 1 4.5 18z"
  })
});

export const ArrowLeftDownBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M5.636 5.637a38 38 0 0 0-2.564 2.816c-1.732 2.12-1.732 4.975 0 7.094a38 38 0 0 0 2.564 2.818 38 38 0 0 0 2.817 2.564c2.119 1.731 4.975 1.731 7.094 0a38 38 0 0 0 2.817-2.564 38 38 0 0 0 2.565-2.818c1.732-2.119 1.73-4.975 0-7.094a38 38 0 0 0-2.565-2.816 38 38 0 0 0-2.817-2.565c-2.12-1.732-4.975-1.732-7.093 0a38 38 0 0 0-2.818 2.565m2.33 3.5a1 1 0 1 1 2 0l-.002 3.347q1.755-1.944 3.508-3.887l.216-.24c.237-.262.565-.415.918-.415s.705.152.968.415c.262.263.415.614.415.967 0 .354-.153.682-.416.918l-.24.217-3.752 3.383 3.09.001a1 1 0 0 1 0 2H8.965c-.552 0-1-.448-1-1z",
    clipRule: "evenodd"
  })
});

export const ArrowLeftUp = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M4.5 15a1.5 1.5 0 0 0 3 0V9.621l9.44 9.44a1.5 1.5 0 1 0 2.12-2.122L9.622 7.5h5.38a1.5 1.5 0 0 0 0-3H6A1.5 1.5 0 0 0 4.5 6z"
  })
});

export const ArrowLeftUpBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M5.636 18.364a38 38 0 0 1-2.564-2.817c-1.732-2.119-1.732-4.974 0-7.093a38 38 0 0 1 2.564-2.818 38 38 0 0 1 2.817-2.564c2.119-1.732 4.975-1.732 7.095 0a38 38 0 0 1 2.816 2.564 38 38 0 0 1 2.565 2.818c1.732 2.119 1.73 4.974 0 7.093a38 38 0 0 1-2.565 2.817 38 38 0 0 1-2.817 2.565c-2.12 1.731-4.975 1.731-7.093 0a38 38 0 0 1-2.818-2.565m2.33-3.5a1 1 0 1 0 2 0l-.002-3.347q1.755 1.943 3.508 3.887l.216.24c.237.262.565.415.918.415s.705-.152.968-.415c.262-.263.415-.614.415-.967 0-.354-.153-.682-.416-.919l-.24-.216-3.752-3.383 3.09-.001a1 1 0 0 0 0-2H8.965c-.552 0-1 .448-1 1z",
    clipRule: "evenodd"
  })
});

export const ArrowRight = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M13.196 4.44a1.5 1.5 0 1 0-2.12 2.12l3.878 3.878-8.445-.413L6 10a1.85 1.85 0 0 0-1.415.537A2.07 2.07 0 0 0 4 12c0 .556.21 1.088.585 1.463S5.47 14.026 6 14l.509-.025q4.08-.201 8.159-.4l-3.593 3.592a1.5 1.5 0 0 0 2.121 2.121l6.365-6.363a1.5 1.5 0 0 0 0-2.122z"
  })
});

export const ArrowRightBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c1.483 0 2.748.073 3.805.179 2.723.274 4.743 2.293 5.017 5.015C20.928 9.251 21 10.517 21 12s-.072 2.748-.178 3.805c-.274 2.723-2.294 4.743-5.017 5.016a38 38 0 0 1-3.805.18c-1.483 0-2.749-.073-3.805-.18-2.723-.274-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.073-2.749.179-3.806.274-2.722 2.293-4.741 5.016-5.015A38 38 0 0 1 12 3m.828 4.122a1 1 0 1 0-1.414 1.414l2.367 2.367-5.228-.27-.322-.016a1.23 1.23 0 0 0-.944.356c-.25.25-.39.606-.39.977 0 .372.14.728.39.978s.59.374.944.355l.322-.016 5.046-.261-2.185 2.185a1 1 0 0 0 1.414 1.415l4.035-4.035c.391-.39.391-1.024 0-1.415z",
    clipRule: "evenodd"
  })
});

export const ArrowRightDown = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.5 9a1.5 1.5 0 0 0-3 0v5.379l-9.44-9.44A1.5 1.5 0 1 0 4.94 7.06l9.439 9.44H9a1.5 1.5 0 0 0 0 3h9a1.5 1.5 0 0 0 1.5-1.5z"
  })
});

export const ArrowRightDownBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M18.364 5.637a38 38 0 0 1 2.564 2.816c1.732 2.12 1.732 4.975 0 7.094a38 38 0 0 1-2.564 2.817 38 38 0 0 1-2.817 2.564c-2.119 1.732-4.975 1.732-7.094 0a38 38 0 0 1-2.817-2.564 38 38 0 0 1-2.564-2.817c-1.732-2.119-1.732-4.975 0-7.094a38 38 0 0 1 2.564-2.816 38 38 0 0 1 2.818-2.565c2.118-1.732 4.974-1.732 7.093 0a38 38 0 0 1 2.817 2.565m-2.329 3.5a1 1 0 1 0-2 0v3.347L10.53 8.597l-.216-.24a1.23 1.23 0 0 0-.919-.415c-.353 0-.705.152-.967.415a1.38 1.38 0 0 0-.415.967c0 .354.153.682.415.918l.24.217 3.752 3.383H9.33a1 1 0 0 0 0 2l5.706.001c.552 0 1-.448 1-1z",
    clipRule: "evenodd"
  })
});

export const ArrowRightUp = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.5 15a1.5 1.5 0 0 1-3 0V9.621l-9.44 9.44a1.5 1.5 0 1 1-2.12-2.122L14.378 7.5H9a1.5 1.5 0 1 1 0-3h9A1.5 1.5 0 0 1 19.5 6z"
  })
});

export const ArrowRightUpBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M18.364 18.364a38 38 0 0 0 2.564-2.817c1.732-2.119 1.732-4.975 0-7.093a38 38 0 0 0-2.564-2.818 38 38 0 0 0-2.817-2.564c-2.119-1.732-4.975-1.732-7.094 0a38 38 0 0 0-2.817 2.564 38 38 0 0 0-2.564 2.818c-1.732 2.119-1.732 4.974 0 7.093a38 38 0 0 0 2.564 2.817 38 38 0 0 0 2.818 2.565c2.119 1.731 4.974 1.731 7.093 0a38 38 0 0 0 2.817-2.565m-2.329-3.5a1 1 0 1 1-2 0v-3.347l-3.506 3.887-.216.24a1.23 1.23 0 0 1-.919.415c-.353 0-.704-.152-.967-.415a1.38 1.38 0 0 1-.415-.967c0-.354.153-.682.415-.919l.24-.216 3.752-3.384H9.33a1 1 0 0 1 0-2h5.706c.552 0 1 .448 1 1z",
    clipRule: "evenodd"
  })
});

export const ArrowUp = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.424 10.667a1.5 1.5 0 0 1-2.12 2.121L13.424 8.91l.413 8.446.026.509c.026.53-.162 1.04-.537 1.415a2.07 2.07 0 0 1-1.463.585 2.07 2.07 0 0 1-1.463-.585 1.85 1.85 0 0 1-.537-1.415l.025-.51.4-8.158-3.592 3.592a1.5 1.5 0 0 1-2.121-2.12l6.363-6.365a1.5 1.5 0 0 1 2.122 0z"
  })
});

export const ArrowUpBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M21 12c0-1.483-.072-2.748-.178-3.805-.274-2.722-2.293-4.742-5.016-5.016A38 38 0 0 0 12 3c-1.483 0-2.748.073-3.805.179-2.723.274-4.742 2.293-5.016 5.016A38 38 0 0 0 3 12c0 1.483.073 2.75.179 3.806.274 2.723 2.294 4.742 5.016 5.015 1.057.107 2.322.18 3.805.18a38 38 0 0 0 3.806-.18c2.723-.274 4.742-2.292 5.016-5.015.106-1.057.178-2.323.178-3.806m-4.122-.828a1 1 0 0 1-1.414 1.414l-2.366-2.367.268 5.228.017.323c.018.353-.105.693-.355.943s-.606.39-.978.39-.728-.14-.978-.39-.373-.59-.355-.943l.017-.323.26-5.045-2.185 2.184a1 1 0 0 1-1.414-1.414l4.034-4.035c.39-.39 1.024-.39 1.415 0z",
    clipRule: "evenodd"
  })
});

export const Bell = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 3c2.538 0 4.816 1.606 5.348 4.087.153.714.296 1.483.409 2.275.192 1.348 1.113 2.461 2.025 3.472C21.057 14.245 19.458 16 17.556 16H6.444c-1.902 0-3.502-1.755-2.227-3.166.913-1.01 1.833-2.124 2.025-3.471.113-.792.256-1.56.41-2.275C7.182 4.607 9.461 3 12 3M12.97 17.753c.926-.001 1.388-.002 1.662.56.275.564.083.808-.3 1.296a2.97 2.97 0 0 1-2.341 1.141c-.952 0-1.8-.445-2.348-1.14-.382-.483-.573-.725-.3-1.288s.733-.565 1.655-.566z"
  })
});

export const Bold = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M16.13 4.156C14.85 3.146 13.046 3 11.264 3c-1.039 0-2.042.11-2.972.316l-.395.094c-1.823.469-2.754 2.145-2.754 3.68V17.57c0 1.167.702 2.364 1.985 2.792 1.236.413 2.653.637 4.136.637h.22c1.638.001 3.597.003 5.13-.56.883-.323 1.755-.872 2.38-1.795.619-.912.862-1.993.862-3.145s-.243-2.233-.862-3.145a4.54 4.54 0 0 0-1.546-1.409c.277-.809.337-1.67.337-2.446 0-1.45-.2-3.194-1.655-4.344M9.143 15.5c0-.744.516-1.402 1.258-1.464q.417-.035.863-.036c1.96 0 3.19.028 3.973.315.31.114.405.222.447.284.048.072.172.303.172.901s-.124.83-.172.901c-.042.062-.137.17-.447.284-.783.287-2.014.315-3.973.315q-.445 0-.863-.036c-.742-.062-1.258-.72-1.258-1.464m0-7.001c0-.745.516-1.402 1.258-1.464q.42-.035.863-.035c.678 0 1.19.029 1.58.08.187.025.361.108.508.227.274.22.433.552.433.903v.57c0 .35-.157.682-.427.905-.151.124-.33.21-.524.236-.264.034-.585.058-.976.07l-.594.009-.49-.012a10 10 0 0 1-.373-.024c-.742-.063-1.258-.72-1.258-1.465",
    clipRule: "evenodd"
  })
});

export const Bookmark = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 16.765c.548 0 3.412 2.102 5.057 3.344.563.425 1.347.15 1.46-.545.22-1.343.483-3.654.483-7.035 0-1.735-.07-3.19-.166-4.375-.217-2.646-1.984-4.797-4.627-5.052A23 23 0 0 0 12 3c-.82 0-1.555.039-2.207.102-2.643.255-4.41 2.406-4.627 5.052A54 54 0 0 0 5 12.53c0 3.381.262 5.692.482 7.035.114.696.898.97 1.46.545 1.646-1.242 4.51-3.344 5.058-3.344"
  })
});

export const Bus = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 2c2.657 0 4.614.233 5.927.475a3.19 3.19 0 0 1 2.598 2.598C20.767 6.386 21 8.343 21 11s-.233 4.614-.475 5.927q-.072.392-.227.741c-.163.368-.3.752-.313 1.154q-.01.363-.03.675c-.088 1.33-.986 2.403-2.316 2.484a11 11 0 0 1-1.278 0c-1.177-.072-2.014-.92-2.252-2.036a41 41 0 0 1-4.22 0c-.237 1.116-1.073 1.965-2.25 2.036a11 11 0 0 1-1.278 0c-1.33-.08-2.228-1.154-2.315-2.484a20 20 0 0 1-.031-.675c-.013-.401-.15-.786-.313-1.154a3.3 3.3 0 0 1-.227-.741C3.233 15.614 3 13.657 3 11s.233-4.614.475-5.927a3.19 3.19 0 0 1 2.598-2.598C7.386 2.233 9.343 2 12 2M7.5 15c-.862 0-1.5.639-1.5 1.5S6.638 18 7.5 18 9 17.361 9 16.5 8.362 15 7.5 15m9 0c-.861 0-1.5.639-1.5 1.5s.639 1.5 1.5 1.5 1.5-.639 1.5-1.5-.639-1.5-1.5-1.5M12 5c-1.394 0-2.499.064-3.333.144-1.293.123-2.375.951-2.559 2.237C6.043 7.836 6 8.374 6 9s.043 1.164.108 1.62c.184 1.285 1.266 2.113 2.559 2.236.834.08 1.94.144 3.333.144s2.499-.064 3.333-.144c1.293-.123 2.375-.951 2.559-2.237.065-.455.108-.993.108-1.619s-.043-1.164-.108-1.62c-.184-1.285-1.266-2.113-2.559-2.236C14.499 5.064 13.393 5 12 5",
    clipRule: "evenodd"
  })
});

export const Butterfly = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M4.906 5.607q.217-.15.45-.27c3.3-1.708 5.643 2.923 5.643 6.638v6.377c0 1.714-.897 3.505-2.61 3.505-2.694 0-4.889-1.83-4.889-4.5 0-1.667 2.35-2.356 2.925-3.15-4.425-1.85-3.874-6.966-1.519-8.6M19.094 5.607a4 4 0 0 0-.45-.27c-3.3-1.708-5.643 2.923-5.643 6.638v6.377c0 1.714.897 3.505 2.61 3.505 2.694 0 4.889-1.83 4.889-4.5 0-1.667-2.35-2.356-2.925-3.15 4.425-1.85 3.874-6.966 1.519-8.6"
  })
});

export const Calendar = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M3 6.125C3 4.399 4.4 3 6.125 3h11.75C19.601 3 21 4.4 21 6.125 21 7.161 20.16 8 19.125 8H4.875A1.875 1.875 0 0 1 3 6.125M18.174 10.005a3 3 0 0 1 2.821 2.821c.003.048.002.101.002.174H17a4 4 0 0 0-4 4v3.99c-.373.009-.804.01-1.313.01h-2.4c-2.133 0-3.2 0-4.022-.396a4 4 0 0 1-1.869-1.869C3 17.913 3 16.846 3 14.714c0-1.6 0-2.399.297-3.016a3 3 0 0 1 1.401-1.401C5.315 10 6.115 10 7.714 10h10.065c.205 0 .308 0 .395.005"
  }), /*#__PURE__*/_jsx("path", {
    d: "M17 15h3.64c-.181.397-.426.766-.73 1.089-.04.042-.083.084-.168.169l-2.4 2.4c-1.087 1.087-1.665 1.66-2.342 1.978V17a2 2 0 0 1 1.796-1.99z"
  })]
});

export const Camera = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M12 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4"
  }), /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 4c1.73 0 3.103.853 3.963 2.153l-.102-.01c2.674.213 4.812 2.038 5.048 4.71A24 24 0 0 1 21 13a24 24 0 0 1-.09 2.148c-.237 2.671-2.375 4.496-5.049 4.708A49 49 0 0 1 12 20c-1.51 0-2.793-.058-3.861-.144-2.674-.213-4.812-2.037-5.048-4.709A24 24 0 0 1 3 13c0-.796.035-1.51.09-2.148.237-2.671 2.375-4.496 5.049-4.708q-.052.003-.103.01C8.896 4.851 10.27 4 12 4m0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    clipRule: "evenodd"
  })]
});

export const Car = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M13.238 3.002c.72.005 1.166.023 1.565.095a6 6 0 0 1 4.636 4.052c.166.513.248 1.126.413 2.348.11.807.19 1.405.235 1.883A3.5 3.5 0 0 1 20 17.662v.838c0 .465 0 .697-.038.89a2 2 0 0 1-1.571 1.571c-.194.039-.426.04-.891.04s-.697-.001-.89-.04a2 2 0 0 1-1.572-1.571C15 19.197 15 18.965 15 18.5V18H9v.5c0 .465 0 .697-.038.89A2 2 0 0 1 7.39 20.96c-.194.039-.426.04-.891.04s-.697-.001-.89-.04a2 2 0 0 1-1.572-1.571C4 19.197 4 18.965 4 18.5v-.838a3.5 3.5 0 0 1-.086-6.283c.024-.247.055-.526.097-.85l.136-1.032c.145-1.07.226-1.672.356-2.15l.059-.198a6 6 0 0 1 4.233-3.965l.402-.087C9.73 3 10.346 3 11.58 3h.84zM7.5 13c-.862 0-1.5.639-1.5 1.5 0 .862.639 1.5 1.5 1.5S9 15.362 9 14.5c0-.861-.638-1.5-1.5-1.5m9 0c-.861 0-1.5.639-1.5 1.5 0 .862.639 1.5 1.5 1.5s1.5-.638 1.5-1.5c0-.861-.639-1.5-1.5-1.5m-4.92-6.5c-1.38 0-1.613.014-1.758.04A2.5 2.5 0 0 0 7.891 8.23c-.046.14-.09.369-.275 1.736-.057.423-.101.762-.136 1.035h9.04l-.136-1.035c-.185-1.367-.23-1.596-.275-1.736a2.5 2.5 0 0 0-1.931-1.689c-.145-.026-.377-.04-1.758-.04z",
    clipRule: "evenodd"
  })
});

export const Card = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M19 11c.943 0 1.414 0 1.707.293S21 12.057 21 13c0 2.828 0 4.242-.879 5.121S17.828 19 15 19H9c-2.828 0-4.242 0-5.121-.879S3 15.828 3 13c0-.943 0-1.414.293-1.707S4.057 11 5 11zM6.6 13c-.114 0-.299-.002-.462.02-.193.025-.496.1-.757.36-.26.262-.336.565-.361.758-.022.163-.02.348-.02.462v.8c0 .114-.002.299.02.462.025.193.1.496.36.757.262.26.565.336.758.361.163.022.348.02.462.02h2.8c.114 0 .299.002.462-.02.193-.025.496-.1.757-.36.26-.262.336-.565.361-.758.022-.163.02-.348.02-.462v-.8c0-.114.002-.299-.02-.462a1.3 1.3 0 0 0-.36-.757 1.3 1.3 0 0 0-.758-.361C9.7 12.998 9.514 13 9.4 13z",
    clipRule: "evenodd"
  }), /*#__PURE__*/_jsx("path", {
    d: "M15 5c2.828 0 4.242 0 5.121.879.29.29.485.64.616 1.08.244.825.366 1.238.066 1.64S19.976 9 18.921 9H5.08c-1.055 0-1.582 0-1.882-.402-.3-.401-.178-.814.066-1.64.13-.439.325-.788.616-1.08C4.758 5 6.172 5 9 5z"
  })]
});

export const Chair = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M17 14.429a3 3 0 0 1 3 3v2.5a1.5 1.5 0 0 1-3 0v-2.5H7v2.5a1.5 1.5 0 0 1-3 0v-2.5a3 3 0 0 1 3-3zM12 3.429c4.283 0 5.64 2.992 5.933 7 .08 1.102-.828 2-1.933 2H8c-1.105 0-2.014-.898-1.933-2 .293-4.008 1.65-7 5.933-7"
  })
});

export const Check = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M18.953 3.992a2.05 2.05 0 0 1 1.496.447c.428.342.705.834.764 1.36a1.9 1.9 0 0 1-.451 1.45l-.5.585-8.991 10.519-.5.585c-.251.292-.614.474-1.003.511a1.5 1.5 0 0 1-.745-.118 1.4 1.4 0 0 1-.484-.27l-.258-.222-4.637-4.002-.258-.223a1.79 1.79 0 0 1-.639-1.362c0-.53.236-1.063.639-1.466s.936-.638 1.466-.637c.53-.001 1.015.234 1.362.637l.223.258 3.077 3.566 7.664-10.244.46-.615a1.9 1.9 0 0 1 1.315-.759"
  })
});

export const ChevronDown = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.56 10.196a1.5 1.5 0 0 0-2.12-2.12l-5.304 5.303-5.303-5.304a1.5 1.5 0 0 0-2.121 2.121l6.363 6.365a1.5 1.5 0 0 0 2.122 0z"
  })
});

export const ChevronLeft = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12.804 4.44a1.5 1.5 0 1 1 2.12 2.12l-5.303 5.304 5.304 5.303a1.5 1.5 0 0 1-2.121 2.121l-6.365-6.363a1.5 1.5 0 0 1 0-2.122z"
  })
});

export const ChevronRight = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M10.56 4.44a1.5 1.5 0 1 0-2.12 2.12l5.303 5.304-5.304 5.303a1.5 1.5 0 0 0 2.121 2.121l6.365-6.363a1.5 1.5 0 0 0 0-2.122z"
  })
});

export const ChevronUp = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.56 14.44a1.5 1.5 0 0 1-2.12 2.12l-5.304-5.303-5.303 5.304a1.5 1.5 0 0 1-2.121-2.121l6.363-6.365a1.5 1.5 0 0 1 2.122 0z"
  })
});

export const Clock = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18m0 3a1 1 0 0 0-1 1v3.93c0 .334-.167.647-.445.832l-2.11 1.406a1 1 0 0 0 1.11 1.665l2.11-1.407A3 3 0 0 0 13 10.93V7a1 1 0 0 0-1-1",
    clipRule: "evenodd"
  })
});

export const Code = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M7.898 4.009c.52-.104 1.088.021 1.56.336s.806.79.91 1.31-.03 1.043-.355 1.463l-.221.286-3.553 4.605 3.553 4.604.22.287c.326.42.46.942.355 1.462-.103.52-.437.996-.909 1.31-.472.316-1.04.441-1.56.337a1.8 1.8 0 0 1-1.213-.89l-.18-.314q-1.612-2.826-3.226-5.65l-.178-.314a1.44 1.44 0 0 1-.182-.615v-.436a1.44 1.44 0 0 1 .182-.613l.178-.314 3.226-5.65.18-.313a1.8 1.8 0 0 1 1.213-.891M13.94 4.345c.472-.315 1.04-.44 1.559-.336.52.104.95.429 1.214.89l.18.314 3.225 5.65.179.314c.141.248.2.54.181.83.02.293-.04.585-.181.834l-.179.313-3.225 5.65-.18.314a1.8 1.8 0 0 1-1.214.89c-.52.105-1.087-.02-1.56-.335-.472-.315-.805-.791-.909-1.31-.104-.52.03-1.043.355-1.463l.22-.287 3.553-4.604-3.553-4.605-.22-.286a1.8 1.8 0 0 1-.355-1.463c.104-.52.437-.995.91-1.31"
  })
});

export const Coefficient = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3.429a9 9 0 1 1 0 18 9 9 0 0 1 0-18m4 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-3.293-4.707a1 1 0 0 0-1.414 0L9.5 12.515l-1.793-1.793a1 1 0 1 0-1.414 1.414l1.793 1.793-1.793 1.793a1 1 0 0 0 1.414 1.414L9.5 15.343l1.793 1.793a1 1 0 0 0 1.414-1.414l-1.793-1.793 1.793-1.793a1 1 0 0 0 0-1.414",
    clipRule: "evenodd"
  })
});

export const ColorTheme = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14",
    clipRule: "evenodd"
  }), /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14m0 3.964c0-1.084-.911-1.998-1.913-1.583a5 5 0 0 0 0 9.238c1.002.415 1.913-.498 1.913-1.583z",
    clipRule: "evenodd"
  })]
});

export const Cross = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M17.958 3.958c.53 0 1.059.23 1.456.628.397.397.628.926.628 1.456s-.23 1.02-.628 1.372l-.317.282L14.253 12l4.844 4.304.317.282c.397.353.628.841.628 1.372 0 .53-.23 1.059-.628 1.456-.397.397-.926.628-1.456.628s-1.02-.23-1.372-.628l-.282-.317L12 14.253l-4.304 4.844-.282.317a1.82 1.82 0 0 1-1.372.628c-.53 0-1.059-.23-1.456-.628-.398-.397-.628-.926-.628-1.456s.23-1.02.628-1.372l.317-.282L9.746 12 4.903 7.696l-.317-.282a1.82 1.82 0 0 1-.628-1.372c0-.53.23-1.059.628-1.456.397-.398.926-.628 1.456-.628s1.02.23 1.372.628l.282.317L12 9.746l4.304-4.843.282-.317a1.82 1.82 0 0 1 1.372-.628"
  })
});

export const Crown = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M17.635 18.143c.754 0 1.365.61 1.365 1.364 0 .658-.469 1.218-1.122 1.3a49 49 0 0 1-5.878.336c-2.659 0-4.704-.19-5.879-.337-.652-.08-1.12-.64-1.12-1.299 0-.753.61-1.364 1.364-1.364zM11.126 3.717a1 1 0 0 1 1.748 0l3.335 6.002a1 1 0 0 0 1.702.075l1.551-2.295c.6-.888 1.987-.34 1.817.718l-1.008 6.245a2 2 0 0 1-1.974 1.681H5.703a2 2 0 0 1-1.974-1.681L2.722 8.217C2.552 7.16 3.938 6.611 4.537 7.5l1.551 2.295a1 1 0 0 0 1.703-.075l3.335-6.002z"
  })
});

export const Cutlery = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "m8.625 11.47.861 7.295a2 2 0 1 1-3.972 0l.861-7.294c-.348 0-.522 0-.67-.015a3 3 0 0 1-2.69-2.691C3 8.618 3 8.444 3 8.095v-3.97a1.125 1.125 0 0 1 2.25 0v3.607a.563.563 0 0 0 1.125 0V4.125a1.125 1.125 0 0 1 2.25 0v3.607a.563.563 0 0 0 1.125 0V4.125a1.125 1.125 0 0 1 2.25 0v3.97c0 .349 0 .523-.014.67a3 3 0 0 1-2.692 2.691c-.147.015-.32.015-.669.015M20 18.904l-.001.172a2 2 0 0 1-1.923 1.923l-.172.001c-.113 0-.169 0-.212-.002a2 2 0 0 1-1.87-2.41c.01-.044.023-.098.051-.207L17 14s-3-1.186-3-5.343c0-2.366 1.943-3.871 3.618-4.729.95-.487 1.425-.73 1.904-.438.478.293.478.886.478 2.072z"
  })
});

export const Dots = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M10 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0M10 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0M10 18a2 2 0 1 1 4 0 2 2 0 0 1-4 0"
  })
});

export const Ecoledirecte = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M20.987 11.521c-.243-3.247-4.462-5.592-9.41-5.19-4.947.4-8.791 3.998-8.568 7.245 0 0 1.834-5.61 8.02-6.096 3.953-.309 7.333 1.547 7.554 4.175.18 2.187-1.945 4.148-4.948 4.992-.575.155-.442-.066-.398-.266.044-.199-.111-.264-.243-.264 0 0-1.06.133-1.767.133q-.767-.002-1.524-.133a.255.255 0 0 1-.265-.265v-.044l.287-1.701v-.044h2.225a.613.613 0 0 0 .42-1.046.63.63 0 0 0-.42-.192H9.899v-.02l.31-1.634a.7.7 0 0 1 .11-.22c.022-.023.043-.023.066-.045.022 0 .022 0 .022-.022.265-.132.95-.22 1.767-.22a6 6 0 0 1 1.656.18.56.56 0 0 0 .486-.463l.154-.817a.445.445 0 0 0-.264-.465c-.442-.176-1.437-.309-2.607-.309-1.414 0-2.586.2-2.806.442a.6.6 0 0 0-.18.332l-.09.861-.508 2.54c-.398 2.165-.861 4.463-.596 4.573 1.625.526 3.339.726 5.042.588 4.97-.398 8.791-3.357 8.526-6.605"
  })
});

export const Emoji = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12.425 2.86c5.473.046 9.526 4.1 9.573 9.572a49 49 0 0 1 0 .85c-.047 5.473-4.1 9.526-9.573 9.573a49 49 0 0 1-.85 0c-5.473-.047-9.526-4.1-9.573-9.573a50 50 0 0 1 0-.85c.047-5.473 4.1-9.526 9.573-9.573a50 50 0 0 1 .85 0M9 13.856a1 1 0 0 0-1 1v1.451c0 1.354 1.791 2.452 4 2.453s4-1.099 4-2.453v-1.45a1 1 0 0 0-1-1zm-1-6c-1.126 0-1.926.492-2.411 1.166A3.23 3.23 0 0 0 5 10.857a1 1 0 1 0 2 0c0-.173.06-.456.212-.666.115-.159.314-.334.788-.334s.673.175.788.334c.151.21.212.493.212.666a1 1 0 1 0 2 0c0-.493-.14-1.21-.589-1.834C9.926 8.35 9.126 7.857 8 7.857m8 0c-1.126 0-1.926.492-2.411 1.166A3.23 3.23 0 0 0 13 10.857a1 1 0 1 0 2 0c0-.173.06-.456.212-.666.115-.159.314-.334.788-.334s.673.175.788.334c.151.21.212.493.212.666a1 1 0 1 0 2 0c0-.493-.14-1.21-.589-1.834-.485-.674-1.285-1.166-2.411-1.166",
    clipRule: "evenodd"
  })
});

export const ExternalLink = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c1.483 0 2.748.073 3.805.179 2.723.274 4.743 2.293 5.017 5.015C20.928 9.251 21 10.517 21 12s-.072 2.748-.178 3.805c-.274 2.723-2.294 4.743-5.017 5.016a38 38 0 0 1-3.805.18c-1.483 0-2.749-.073-3.805-.18-2.723-.274-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.073-2.749.179-3.806.274-2.722 2.293-4.741 5.016-5.015A38 38 0 0 1 12 3m-.5 4a1 1 0 1 0 0 2h2.086l-6.793 6.793a1 1 0 1 0 1.414 1.414L15 10.414V13a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1z",
    clipRule: "evenodd"
  })
});

export const Filter = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M11.785 3c2.251 0 4.098.224 5.603.563 4.058.914 4.031 5.369 1.075 8.296l-.345.342a9 9 0 0 1-2.55 1.772c-.75.346-1.124.52-1.282.765-.157.247-.157.595-.157 1.29v3.445c0 1.293-1.546 1.96-2.487 1.074a7 7 0 0 1-2.2-5.099c0-.191 0-.287-.011-.36a.93.93 0 0 0-.497-.724 4 4 0 0 0-.4-.166 8.95 8.95 0 0 1-3.08-1.997l-.346-.342C2.152 8.932 2.124 4.477 6.184 3.563 7.689 3.223 9.534 3 11.785 3m0 2.21c-1.89 0-3.422.07-4.658.176-1.742.148-1.719 1.637-.017 2.038 3.075.725 6.276.725 9.35 0 1.702-.401 1.726-1.89-.017-2.038a55 55 0 0 0-4.658-.176",
    clipRule: "evenodd"
  })
});

export const Folder = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M18.295 12c1.462 0 2.194 0 2.618.373.19.166.334.378.42.614.193.531-.073 1.213-.603 2.575-.71 1.822-1.066 2.733-1.725 3.353a4 4 0 0 1-1.018.695c-.816.39-1.795.39-3.75.39H9.831c-1.945 0-2.917 0-3.727-.382a4 4 0 0 1-1.12-.787c-.634-.633-.964-1.548-1.624-3.378-.468-1.3-.702-1.952-.521-2.459a1.5 1.5 0 0 1 .458-.651C3.714 12 4.405 12 5.788 12zM8.7 4c.484 0 .726 0 .947.05a2 2 0 0 1 1.063.638c.148.171.262.385.49.812s.341.64.49.812a2 2 0 0 0 1.063.637c.22.05.463.051.947.051H17a3 3 0 0 1 3 3H4V8.571c0-1.464 0-2.197.25-2.77A3 3 0 0 1 5.8 4.25C6.374 4 7.106 4 8.57 4z"
  })
});

export const Font = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M8.303 5.71c1.362-3.297 6.032-3.297 7.394 0l2.29 5.542 2.817 5.885a2 2 0 1 1-3.608 1.726l-.878-1.834H7.682l-.878 1.834a2 2 0 1 1-3.608-1.726l2.816-5.885zm1.39 7.112-.022.051-.024.049-.051.107h4.808l-.052-.107-.023-.049-.021-.05L12 7.236z"
  })
});

export const Gallery = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 3c1.483 0 2.748.072 3.805.179 2.723.273 4.743 2.293 5.016 5.016C20.927 9.252 21 10.517 21 12s-.073 2.748-.179 3.805c-.274 2.723-2.293 4.743-5.016 5.016A38 38 0 0 1 12 21c-1.483 0-2.748-.073-3.805-.179-2.723-.274-4.743-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.072-2.748.179-3.805.273-2.723 2.293-4.743 5.016-5.016A38 38 0 0 1 12 3M9.842 13.212a2 2 0 0 0-2.683 0l-1.628 1.47a1.1 1.1 0 0 0-.362.923c.179 1.777 1.45 3.047 3.226 3.226.988.1 2.187.169 3.605.169s2.617-.07 3.605-.169c1.217-.122 2.195-.758 2.747-1.717.357-.617.082-1.366-.447-1.844l-.063-.058a2 2 0 0 0-2.683 0l-.212.191a2 2 0 0 1-2.681 0zM15 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
  })
});

export const Gears = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c.593 0 1.309.202 1.892.412.66.238.99.948.822 1.63l-.183.746c-.098.4.114.809.47 1.016.357.207.814.184 1.112-.102l.555-.531c.508-.486 1.287-.557 1.824-.104.473.4 1.006.92 1.302 1.433.297.514.48 1.235.59 1.845.124.69-.328 1.33-1.002 1.527l-.739.215c-.396.115-.643.5-.643.913 0 .412.246.797.642.913l.741.216c.674.197 1.125.835 1 1.526-.11.61-.292 1.331-.589 1.845-.296.514-.829 1.032-1.302 1.433-.537.453-1.316.383-1.824-.103l-.555-.532c-.298-.286-.754-.31-1.112-.103-.356.207-.569.616-.47 1.016l.183.747c.167.682-.161 1.393-.822 1.63-.583.21-1.3.412-1.892.412-.594 0-1.309-.201-1.892-.411-.66-.238-.99-.949-.822-1.631l.182-.748c.098-.4-.114-.809-.47-1.015-.358-.206-.814-.183-1.112.103l-.554.532c-.508.486-1.288.556-1.824.103-.473-.4-1.006-.92-1.302-1.433-.297-.514-.48-1.235-.59-1.845-.125-.69.327-1.33 1-1.526l.74-.216c.396-.115.644-.5.644-.913 0-.412-.248-.798-.644-.913l-.74-.215c-.673-.196-1.124-.836-1-1.527.11-.61.293-1.331.59-1.845.296-.514.829-1.032 1.302-1.433.537-.453 1.316-.382 1.824.104l.554.531c.298.285.754.309 1.112.102.356-.207.568-.615.47-1.016l-.182-.746c-.167-.682.161-1.392.822-1.63.583-.21 1.298-.412 1.891-.412m0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    clipRule: "evenodd"
  })
});

export const Ghost = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3.857c4.097 0 7.727 2.746 8.41 6.785.333 1.968.59 4.057.59 5.807q0 .213-.003.423c-.04 2.8-.061 4.2-1.33 4.683s-2.305-.648-4.375-2.91l-.26-.285c-1.118 2.026-1.677 3.04-2.465 3.273-.37.109-.764.109-1.134 0-.788-.234-1.347-1.247-2.464-3.273l-.261.285c-2.07 2.262-3.106 3.393-4.375 2.91s-1.29-1.883-1.33-4.683Q3 16.662 3 16.449c0-1.75.257-3.839.59-5.807.683-4.04 4.313-6.785 8.41-6.785m-3.5 6c-1.38 0-2.5 1.193-2.5 2.664s1.12.332 2.5.332 2.5 1.14 2.5-.332-1.12-2.664-2.5-2.664m7 0c-1.38 0-2.5 1.193-2.5 2.664s1.12.332 2.5.332 2.5 1.14 2.5-.332-1.12-2.664-2.5-2.664",
    clipRule: "evenodd"
  })
});

export const Globe = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2M4.74 9a.24.24 0 0 0-.22.16A8 8 0 0 0 12 20c.509 0 1-.328 1-.837a1.837 1.837 0 0 0-1.837-1.836H8.826a1.044 1.044 0 0 1 0-2.087h.043c.6 0 1.087-.486 1.087-1.087v-.51c0-.881-.714-1.596-1.596-1.596h-.358a1.523 1.523 0 0 1-1.523-1.524C6.479 9.683 5.796 9 4.955 9zm7.778-1.774a1.703 1.703 0 0 0 1.185 2.925h1.873A2.425 2.425 0 0 1 18 12.576v.924c0 .294.084.567.23.798.457.723 1.428.168 1.602-.669q.166-.79.168-1.629a7.99 7.99 0 0 0-3.654-6.717c-.679-.44-1.556-.262-2.136.3z",
    clipRule: "evenodd"
  })
});

export const GlobeCross = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M12 2c5.083 0 9.278 3.792 9.914 8.701.048.369-.38.612-.73.486A3.1 3.1 0 0 0 20.128 11l-.001.001a.215.215 0 0 1-.214-.18 8 8 0 0 0-3.566-5.538c-.679-.44-1.556-.262-2.136.301l-1.692 1.642a1.703 1.703 0 0 0 1.185 2.925h1.873c1.071 0 1.977.697 2.297 1.66a.26.26 0 0 1-.057.25q-.033.037-.068.078l-.07.08a.66.66 0 0 1-.995 0l-.07-.08-.07-.079a3.05 3.05 0 0 0-2.309-1.059h-.002c-.892 0-1.7.385-2.273.958A3.23 3.23 0 0 0 11 14.231c0 .867.364 1.647.943 2.205l.119.108.077.067.08.07.239.208a.385.385 0 0 1 0 .58c-.135.117-.33.123-.49.045a1.8 1.8 0 0 0-.805-.187H8.826a1.044 1.044 0 0 1 0-2.087h.043c.6 0 1.087-.486 1.087-1.087v-.51c0-.881-.714-1.596-1.596-1.596h-.358a1.523 1.523 0 0 1-1.523-1.524C6.479 9.683 5.796 9 4.955 9H4.74a.24.24 0 0 0-.218.16 8 8 0 0 0 6.297 10.752.216.216 0 0 1 .182.214c0 .811-.57 1.782-1.36 1.592C5.258 20.658 2 16.71 2 12 2 6.477 6.477 2 12 2"
  }), /*#__PURE__*/_jsx("path", {
    d: "M20.127 13c.311 0 .624.137.86.373s.374.548.373.86c0 .311-.137.596-.373.801l-.159.139-2.31 2.007 2.31 2.006.16.14c.235.204.373.49.372.801 0 .311-.137.624-.373.86-.236.235-.549.373-.86.372-.312 0-.597-.137-.802-.373l-.139-.159-2.006-2.308-2.006 2.308-.139.16c-.204.235-.49.373-.802.372-.31 0-.624-.137-.86-.373a1.23 1.23 0 0 1-.373-.859c0-.312.137-.597.373-.802l.16-.139 2.308-2.006-2.309-2.007-.159-.139a1.06 1.06 0 0 1-.373-.802c0-.31.137-.623.373-.859s.549-.373.86-.373c.312 0 .598.137.802.373l.139.16 2.006 2.306q1.003-1.154 2.006-2.307l.14-.159c.204-.236.49-.373.801-.373"
  })]
});

export const Grades = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M8.464 20.062a2 2 0 1 1-3.464-2l.325-.562a1 1 0 0 1 .866-.5H8.5a1 1 0 0 1 .866 1.5zM18.964 18.062a2 2 0 0 1-3.464 2L14.6 18.5a1 1 0 0 1 .866-1.5h2.309a1 1 0 0 1 .866.5z"
  }), /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M15.5 4c2.346 0 3.518 0 4.326.62q.313.241.554.554c.62.808.62 1.98.62 4.326s0 3.518-.62 4.326q-.241.313-.554.554c-.808.62-1.98.62-4.326.62h-7c-2.346 0-3.518 0-4.326-.62a3 3 0 0 1-.554-.554C3 13.018 3 11.846 3 9.5s0-3.518.62-4.326q.241-.313.554-.554C4.982 4 6.154 4 8.5 4zm2.173 2.26a1 1 0 0 0-1.413.067l-3.806 4.186-1.987-2.186a1 1 0 0 0-1.48 0l-2.727 3a1 1 0 0 0 1.48 1.346l1.987-2.187 1.988 2.187a1 1 0 0 0 1.48 0l4.545-5a1 1 0 0 0-.067-1.413",
    clipRule: "evenodd"
  })]
});

export const GraduationHat = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M16.487 12.462c.128.416.34 1.457.34 3.803 0 1.564-1.395 1.742-2.892 2.555-1.05.57-1.576.855-3.608.855S7.77 19.39 6.72 18.82c-1.498-.813-2.893-.991-2.893-2.555 0-2.345.211-3.386.34-3.803 2.338 1.41 3.695 2.14 5.157 2.325.666.084 1.34.084 2.006 0 1.462-.185 2.819-.915 5.157-2.325"
  }), /*#__PURE__*/_jsx("path", {
    d: "M8.37 3.697a8 8 0 0 1 4.22.03c.976.275 1.908.815 3.771 1.898l.257.15c1.45.841 2.176 1.263 2.737 1.83a6 6 0 0 1 1.374 2.168c.272.75.344 1.585.486 3.256l.497 5.83a1.25 1.25 0 1 1-2.497.106v-5.502c0-.868 0-1.302-.092-1.595a2 2 0 0 0-2.295-1.361c-.302.06-.682.268-1.443.683-1.084.592-1.627.888-2.174 1.09a8 8 0 0 1-5.46.033c-.55-.196-1.095-.485-2.187-1.063l-.93-.494c-1.36-.722-2.041-1.084-2.325-1.534a2 2 0 0 1-.026-2.093c.273-.457.945-.834 2.288-1.588C6.45 4.485 7.39 3.957 8.37 3.697"
  })]
});

export const Grid = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M7 13c.552 0 1.036.023 1.454.058 1.364.114 2.374 1.124 2.488 2.488.035.418.058.902.058 1.454s-.023 1.036-.058 1.454c-.114 1.363-1.124 2.374-2.488 2.488C8.036 20.977 7.552 21 7 21s-1.036-.023-1.454-.058c-1.364-.114-2.374-1.125-2.488-2.488A17 17 0 0 1 3 17c0-.552.023-1.036.058-1.454.114-1.364 1.124-2.374 2.488-2.488C5.964 13.023 6.448 13 7 13M17 13c.552 0 1.036.023 1.454.058 1.363.114 2.374 1.124 2.488 2.488.035.418.058.902.058 1.454s-.023 1.036-.058 1.454c-.114 1.363-1.125 2.374-2.488 2.488-.418.035-.902.058-1.454.058s-1.036-.023-1.454-.058c-1.364-.114-2.374-1.125-2.488-2.488A18 18 0 0 1 13 17c0-.552.023-1.036.058-1.454.114-1.364 1.124-2.374 2.488-2.488.418-.035.902-.058 1.454-.058M7 3c.552 0 1.036.023 1.454.058 1.364.114 2.374 1.124 2.488 2.488.035.418.058.902.058 1.454s-.023 1.036-.058 1.454c-.114 1.364-1.124 2.374-2.488 2.488C8.036 10.977 7.552 11 7 11s-1.036-.023-1.454-.058c-1.364-.114-2.374-1.124-2.488-2.488A17 17 0 0 1 3 7c0-.552.023-1.036.058-1.454.114-1.364 1.124-2.374 2.488-2.488C5.964 3.023 6.448 3 7 3M17 3c.552 0 1.036.023 1.454.058 1.363.114 2.374 1.124 2.488 2.488.035.418.058.902.058 1.454s-.023 1.036-.058 1.454c-.114 1.364-1.125 2.374-2.488 2.488-.418.035-.902.058-1.454.058s-1.036-.023-1.454-.058c-1.364-.114-2.374-1.124-2.488-2.488A18 18 0 0 1 13 7c0-.552.023-1.036.058-1.454.114-1.364 1.124-2.374 2.488-2.488C15.964 3.023 16.448 3 17 3"
  })
});

export const Heart = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M4.684 15.857c-2.281-3.58-1.922-5.852-.815-7.895 1.486-2.744 6.024-3.318 7.922 1.42.072.18.346.18.418 0 1.899-4.738 6.436-4.164 7.922-1.42 1.107 2.043 1.466 4.315-.815 7.895-.87 1.366-2.51 2.757-4.018 3.856a5.58 5.58 0 0 1-6.596 0c-1.508-1.099-3.148-2.49-4.018-3.856"
  })
});

export const Home = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M9.77 4.478a3 3 0 0 1 4.46 0l4.505 5.006c1.503 1.67 2.86 3.542 3.152 5.77a13.5 13.5 0 0 1-.286 4.995C21.323 21.351 20.28 22 19.145 22H15v-5a3 3 0 1 0-6 0v5H4.854c-1.136 0-2.177-.649-2.455-1.75a13.497 13.497 0 0 1-.286-4.996c.291-2.228 1.649-4.1 3.152-5.77z"
  })
});

export const Info = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c1.483 0 2.748.073 3.805.179 2.723.274 4.743 2.293 5.017 5.015C20.928 9.251 21 10.517 21 12s-.072 2.748-.178 3.805c-.274 2.723-2.294 4.743-5.017 5.016a38 38 0 0 1-3.805.18c-1.483 0-2.749-.073-3.805-.18-2.723-.274-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.073-2.749.179-3.806.274-2.722 2.293-4.741 5.016-5.015A38 38 0 0 1 12 3m0 8a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1m0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2",
    clipRule: "evenodd"
  })
});

export const InfoBox = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c1.483 0 2.748.073 3.805.179 2.723.274 4.743 2.293 5.017 5.015C20.928 9.251 21 10.517 21 12s-.072 2.748-.178 3.805c-.274 2.723-2.294 4.743-5.017 5.016a38 38 0 0 1-3.805.18c-1.483 0-2.749-.073-3.805-.18-2.723-.274-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.073-2.749.179-3.806.274-2.722 2.293-4.741 5.016-5.015A38 38 0 0 1 12 3m0 8a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1m0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2",
    clipRule: "evenodd"
  })
});

export const Link = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M9.415 10.429a1.5 1.5 0 0 1 2.12 2.12 10 10 0 0 0-.223.231c-.56.6-.606 1.602.24 2.546q.528.593 1.276 1.344.476.475.888.86c1.203 1.123 2.568 1.096 3.232.432.606-.606.867-1.051.975-1.33.1-.258.075-.384.067-.42a.3.3 0 0 0-.092-.155l-.007-.008.012.01.017.011.012.01q.003.001.006.004l.005.002a1.5 1.5 0 0 1 1.653-2.503l-.58.882c.553-.84.58-.88.582-.881l.002.002.005.003.01.006q.008.007.02.014l.05.037q.057.041.134.105a3.32 3.32 0 0 1 1.09 1.775c.327 1.389-.222 2.94-1.839 4.557-2.274 2.274-5.565 1.352-7.4-.36a39 39 0 0 1-2.354-2.396c-1.571-1.755-2.108-4.55-.194-6.597q.139-.149.293-.301"
  }), /*#__PURE__*/_jsx("path", {
    d: "M5.981 4.112c2.274-2.274 5.566-1.35 7.4.362a39 39 0 0 1 2.353 2.395c1.572 1.755 2.11 4.55.196 6.596q-.14.15-.293.303a1.5 1.5 0 0 1-2.122-2.122q.119-.117.224-.23c.561-.6.606-1.602-.24-2.546a35.758 35.758 0 0 0-2.165-2.203c-1.203-1.123-2.566-1.097-3.23-.433-.606.606-.867 1.051-.975 1.33-.1.257-.076.383-.068.42a.3.3 0 0 0 .092.156l.007.008q0-.001-.012-.01l-.016-.013-.013-.008-.006-.005-.005-.002a1.5 1.5 0 0 1-1.653 2.502l.58-.881c-.552.837-.58.88-.582.881l-.002-.002-.005-.002-.009-.007-.02-.014-.051-.036a3.263 3.263 0 0 1-.496-.462A3.3 3.3 0 0 1 4.14 8.67c-.325-1.389.223-2.94 1.84-4.558"
  })]
});

export const List = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 3c1.483 0 2.748.073 3.805.179 2.723.273 4.742 2.293 5.016 5.015C20.927 9.251 21 10.517 21 12s-.073 2.748-.179 3.805c-.274 2.723-2.293 4.743-5.016 5.016A38 38 0 0 1 12 21c-1.483 0-2.749-.073-3.806-.179-2.722-.274-4.742-2.293-5.015-5.016A38 38 0 0 1 3 12c0-1.483.072-2.749.179-3.806.274-2.722 2.293-4.741 5.015-5.015A38 38 0 0 1 12 3m-.5 12c-1.31 0-2.281.025-2.937.052C7.86 15.08 7 15.298 7 16s.86.92 1.563.948c.656.027 1.626.052 2.937.052s2.281-.025 2.938-.052C15.139 16.92 16 16.702 16 16s-.86-.92-1.562-.948A74 74 0 0 0 11.5 15m-1-4c-.91 0-1.609.02-2.111.043-.657.03-1.389.3-1.389.957 0 .658.732.927 1.389.957C8.89 12.98 9.59 13 10.5 13s1.609-.02 2.111-.043c.657-.03 1.389-.3 1.389-.957 0-.658-.732-.927-1.389-.957A46 46 0 0 0 10.5 11M12 7a90 90 0 0 0-3.347.055C7.927 7.082 7 7.274 7 8s.927.918 1.653.945C9.383 8.973 10.487 9 12 9s2.617-.027 3.347-.055C16.073 8.918 17 8.726 17 8s-.927-.918-1.653-.945A90 90 0 0 0 12 7"
  })
});

export const Lock = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12.324 3.866c3.316.171 5.504 2.964 5.636 6.349q.029.78.035 1.68c.656.043 1.117.14 1.505.364a3 3 0 0 1 1.098 1.098c.402.696.402 1.63.402 3.5s0 2.804-.402 3.5a3 3 0 0 1-1.098 1.098c-.696.402-1.63.402-3.5.402H8c-1.87 0-2.804 0-3.5-.402a3 3 0 0 1-1.098-1.098C3 19.661 3 18.727 3 16.857s0-2.804.402-3.5A3 3 0 0 1 4.5 12.26c.387-.223.849-.32 1.504-.365q.002-.336.007-.655l.029-1.024C6.176 6.72 8.503 3.857 12 3.857zM12 6.857c-1.497 0-2.872 1.172-2.962 3.474q-.026.707-.033 1.526h5.99a51 51 0 0 0-.033-1.526c-.09-2.302-1.465-3.474-2.962-3.474",
    clipRule: "evenodd"
  })
});

export const Login = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M15.876 3c-1.272 0-2.282.143-3.045.321-1.012.236-1.71 1.004-2.01 1.966-.118.38.101.756.382 1.036l3.772 3.773a2.5 2.5 0 0 1 0 3.536l-3.772 3.772a2.5 2.5 0 0 1-.346.287.39.39 0 0 0-.177.362c.146 1.259.916 2.338 2.15 2.626.764.178 1.774.321 3.046.321s2.281-.143 3.045-.321c1.234-.288 2.004-1.367 2.15-2.626.152-1.313.305-3.31.305-6.053s-.153-4.74-.305-6.053c-.146-1.259-.916-2.338-2.15-2.626C18.157 3.143 17.148 3 15.876 3M9.643 7.383a1.002 1.002 0 0 0-1.415 1.415l2.143 2.14-6.656-.289-.381-.016a1.24 1.24 0 0 0-.943.361c-.25.25-.39.603-.39.972s.14.722.39.972.59.377.943.36l.381-.016 6.442-.281-1.929 1.929a1 1 0 0 0 1.415 1.414l3.773-3.774a1 1 0 0 0 0-1.414z"
  })
});

export const Logout = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M7.5 3c1.272 0 2.281.143 3.045.321 1.234.288 2.004 1.367 2.15 2.626q.069.582.131 1.346c.065.811-.634 1.47-1.443 1.38L11 8.634c-.884-.098-1.732.167-2.357.794-.626.623-.976 1.557-.976 2.539s.35 1.916.976 2.539c.625.626 1.473.891 2.357.794l.382-.041c.81-.089 1.512.568 1.448 1.382a38 38 0 0 1-.136 1.413c-.146 1.259-.916 2.338-2.15 2.626C9.78 20.857 8.772 21 7.5 21s-2.282-.143-3.045-.321c-1.234-.288-2.004-1.367-2.15-2.626C2.152 16.74 2 14.743 2 12s.152-4.74.305-6.053c.146-1.259.916-2.338 2.15-2.626C5.218 3.143 6.228 3 7.5 3m8.396 4.384a1 1 0 0 1 1.414 0l3.773 3.773a1 1 0 0 1 0 1.414l-3.773 3.773a1 1 0 0 1-1.414-1.414L17.824 13l-6.442.281L11 13.3a1.25 1.25 0 0 1-.943-.361c-.25-.25-.39-.603-.39-.972 0-.37.14-.722.39-.972s.59-.377.943-.361l.382.016 6.655.29-2.141-2.141a1 1 0 0 1 0-1.414"
  })
});

export const Mail = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M18.82 9.96c.508-.394.762-.592 1.008-.635.412-.072.86.147 1.055.517.117.22.117.532.117 1.158v2c0 2.828 0 4.242-.879 5.121S17.828 19 15 19H9c-2.828 0-4.242 0-5.121-.879S3 15.828 3 13v-2c0-.625 0-.938.117-1.158.196-.37.643-.588 1.055-.516.245.043.5.24 1.006.634l3.138 2.441a6 6 0 0 0 7.368 0z"
  }), /*#__PURE__*/_jsx("path", {
    d: "M15 5c2.828 0 4.242 0 5.121.879q.15.15.266.323a.01.01 0 0 1-.001.009l-5.93 4.612a4 4 0 0 1-4.912 0l-5.93-4.612q-.005-.004-.002-.01.118-.172.267-.322C4.758 5 6.172 5 9 5z"
  })]
});

export const MapPin = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c4.418 0 8 3 8 8.389 0 4.159-4.765 8.219-6.94 9.855a1.75 1.75 0 0 1-2.12 0C8.765 19.608 4 15.548 4 11.39 4 5.999 7.582 3 12 3m0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    clipRule: "evenodd"
  })
});

export const Menu = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 17c2.472 0 3.263.043 4.429.085 1.114.04 2.571.3 2.571 1.415s-1.457 1.375-2.571 1.415C15.263 19.957 14.472 20 12 20s-3.263-.043-4.429-.085C6.457 19.875 5 19.615 5 18.5s1.457-1.375 2.571-1.415C8.737 17.043 9.528 17 12 17M12 11c2.472 0 2.263.043 3.429.085 1.114.04 2.571.3 2.571 1.415s-1.457 1.375-2.571 1.415c-1.166.042-.957.085-3.429.085s-2.263-.043-3.429-.085C7.457 13.875 6 13.615 6 12.5s1.457-1.375 2.571-1.415C9.737 11.043 9.528 11 12 11M12 5c2.472 0 4.263.043 5.429.085 1.114.04 2.571.3 2.571 1.415s-1.457 1.375-2.571 1.415A152 152 0 0 1 12 8c-2.472 0-4.263-.043-5.429-.085C5.457 7.875 4 7.615 4 6.5s1.457-1.375 2.571-1.415C7.737 5.043 9.528 5 12 5"
  })
});

export const Metro = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M16.112 6.354c.545.046.866.413 1.001.62a2.1 2.1 0 0 1 .262.633c.09.358.131.801.153 1.242.046.903.015 2.075-.042 3.209a98 98 0 0 1-.33 4.452l-.008.077-.003.02v.007a1.15 1.15 0 0 1-2.289-.228v-.006l.002-.019.007-.073.028-.281c.022-.243.054-.591.088-1.009.07-.837.153-1.948.209-3.056.025-.515.043-1.023.052-1.497l-.234.422c-.38.69-.791 1.438-1.168 2.01a5.7 5.7 0 0 1-.617.804c-.111.115-.255.246-.43.355-.166.105-.442.24-.793.24s-.626-.135-.793-.24a2.3 2.3 0 0 1-.429-.355c-.221-.23-.43-.52-.617-.803-.377-.573-.788-1.321-1.168-2.01q-.12-.215-.235-.422c.01.474.028.981.054 1.496a95 95 0 0 0 .296 4.065l.028.281.007.073.002.019v.006a1.15 1.15 0 0 1-2.271.345l-.018-.117v-.007l-.002-.02-.008-.077a87 87 0 0 1-.118-1.32c-.071-.851-.156-1.99-.213-3.132-.057-1.134-.087-2.306-.042-3.21.022-.44.064-.883.154-1.24.043-.17.116-.41.26-.633.145-.222.501-.625 1.114-.625l.128.005c.29.028.519.142.665.234a2.3 2.3 0 0 1 .429.355c.22.23.43.52.617.803.377.573.788 1.321 1.168 2.01.36.654.696 1.259.992 1.725a35 35 0 0 0 .993-1.724c.38-.69.791-1.438 1.168-2.01.187-.284.396-.574.617-.804.111-.115.255-.246.429-.355.167-.105.443-.24.794-.24z"
  }), /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 1.5c5.799 0 10.5 4.701 10.5 10.5S17.799 22.5 12 22.5 1.5 17.799 1.5 12 6.201 1.5 12 1.5m0 2.3a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4",
    clipRule: "evenodd"
  })]
});

export const Minus = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18m-4 8a1 1 0 1 0 0 2h7.965l.101-.004a1.001 1.001 0 0 0 0-1.99L15.965 11z",
    clipRule: "evenodd"
  })
});

export const Moon = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M11 3.857c.79 0 1 1.185.464 1.764a5.5 5.5 0 0 0 7.77 7.772c.58-.536 1.766-.325 1.766.464.003 4.97-4.03 8-9 8a9 9 0 0 1-9-9c0-4.97 3.03-9 8-9"
  })
});

export const Newspaper = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M5.96 4.799a.97.97 0 0 1 1.445.013L9.333 7l1.188-1.325c.7-.781 1.051-1.172 1.5-1.17s.796.396 1.49 1.183L14.667 7l1.965-2.192a.975.975 0 0 1 1.45 0 9.43 9.43 0 0 1 2.364 5.112c.26 2.06.554 4.69.554 6.08 0 .629-.06 1.194-.15 1.689-.141.78-.213 1.172-.89 1.838-.675.667-1.222.759-2.316.94-1.562.261-3.668.533-5.644.533s-4.082-.272-5.644-.532c-1.094-.182-1.64-.274-2.317-.94-.676-.667-.748-1.058-.89-1.84A9.5 9.5 0 0 1 3 16c0-1.383.29-3.992.549-6.046.243-1.928 1.1-3.72 2.411-5.155M7.6 10c-.114 0-.299-.002-.462.02-.193.026-.496.1-.757.361-.26.26-.336.564-.361.757-.022.163-.02.349-.02.462v2.8c0 .114-.002.3.02.462.025.193.1.497.36.757.261.26.565.336.758.362.163.022.348.02.462.02h2.8c.114 0 .299.002.462-.02.193-.026.496-.101.757-.362.26-.26.335-.564.361-.757.022-.163.02-.348.02-.462v-2.8c0-.113.002-.299-.02-.462a1.3 1.3 0 0 0-.36-.757 1.3 1.3 0 0 0-.758-.361c-.163-.022-.348-.02-.462-.02zm7.4 4a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2zm0-4a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2z",
    clipRule: "evenodd"
  })
});

export const Palette = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12.243 3.857c5.105 0 10.322 4.214 8.318 9-1.388 3.317-6.418 1.914-7.856 3.5-1.694 1.869 2.772 5.5-2.773 5.5-4.825 0-6.932-4.03-6.932-9s4.139-9 9.243-9M8 13.857a2 2 0 1 0 0 4 2 2 0 0 0 0-4m1-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4m6-1a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
    clipRule: "evenodd"
  })
});

export const Paper = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M12 7.828a4 4 0 0 0 4 4c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.082c.152.368.152.834.152 1.766V15c0 2.828 0 4.243-.879 5.122S15.828 21 13 21h-2c-2.828 0-4.242 0-5.121-.878C5 19.242 5 17.828 5 14.999v-4c0-2.808 0-4.212.674-5.221a4 4 0 0 1 1.103-1.104c.39-.26.837-.42 1.402-.518 1.538-.267 2.307-.401 2.99.09.073.053.165.13.23.193C12 5.028 12 5.961 12 7.828"
  }), /*#__PURE__*/_jsx("path", {
    d: "M14 6.365c0-1.004 0-1.506.304-1.636s.666.219 1.39.915l2.792 2.688c.316.304.501.701.507 1.14.003.186-.147.356-.334.356H16l-.204-.011A2 2 0 0 1 14 7.827z"
  })]
});

export const PapillonApp = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M12 3.286c1.483 0 2.748.072 3.805.179 2.723.273 4.743 2.292 5.017 5.015q.048.497.085 1.056l-.072-.03-.116-.038c-.576-.165-1.11.04-1.482.272-.406.255-.78.638-1.116 1.074q-.266.346-.528.77a11.5 11.5 0 0 0-1.723-2.832c-1.068-1.295-2.286-2.32-3.427-2.907-.569-.292-1.165-.5-1.744-.548-.585-.05-1.223.065-1.739.505-.51.435-.736 1.059-.813 1.642-.08.593-.023 1.251.129 1.913q.109.476.288.974a8 8 0 0 0-.85.151c-.623.148-1.21.379-1.682.719-.477.344-.886.842-1 1.505-.115.662.1 1.27.431 1.756.327.48.8.9 1.334 1.255 1.07.711 2.552 1.274 4.192 1.568 1.675.3 3.27.145 4.496-.206a15 15 0 0 0-.304 1.904c-.056.634-.056 1.246.04 1.753q.037.202.108.412c-.954.082-2.062.138-3.329.138-1.483 0-2.749-.073-3.805-.179-2.723-.274-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12.286c0-1.483.073-2.75.179-3.806.274-2.723 2.293-4.742 5.016-5.015A38 38 0 0 1 12 3.285"
  }), /*#__PURE__*/_jsx("path", {
    d: "M19.994 11.699q.016.263-.01.647c-.071.966-.362 2.29-.874 3.722-.513 1.433-1.127 2.635-1.682 3.42q-.152.212-.284.367a7 7 0 0 1 .029-.696c.092-1.041.39-2.405.866-3.775a2 2 0 0 0 .053-.14q.056-.128.086-.246c.492-1.324 1.04-2.332 1.527-2.963q.16-.204.29-.336M9.5 12.262c.263.426.561.847.895 1.251a8 8 0 0 0 2.308 1.927 8 8 0 0 1-1.36-.124c-1.436-.257-2.645-.738-3.439-1.266-.398-.264-.65-.513-.787-.713-.132-.194-.117-.281-.116-.29.001-.005.015-.09.201-.224.193-.139.512-.285.974-.395.382-.09.83-.148 1.324-.167M12.17 12.505c1.286.268 2.369.71 3.099 1.196a3.3 3.3 0 0 1 .68.578 3.4 3.4 0 0 1-1.156-.128c-.842-.23-1.801-.754-2.624-1.646M10.533 7.29c.233.02.57.115.995.334.845.435 1.86 1.261 2.8 2.4.389.472.706.95.966 1.411a12.6 12.6 0 0 0-3.11-.968c-.5-.09-.995-.148-1.476-.181a7 7 0 0 1-.482-1.374c-.115-.503-.136-.912-.097-1.204.04-.302.129-.385.129-.385a.1.1 0 0 1 .052-.022c.04-.01.111-.02.223-.011"
  })]
});

export const PapillonIcon = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M9.007 3.297c.605.05 1.232.269 1.834.579 1.207.621 2.5 1.706 3.636 3.083a12.2 12.2 0 0 1 1.88 3.125q.309-.517.624-.927c.356-.462.75-.865 1.174-1.131.389-.243.939-.45 1.528-.282l.118.039.127.054c.611.29.855.907.958 1.335.12.503.136 1.104.09 1.729-.092 1.264-.455 2.863-1.046 4.516-.592 1.652-1.324 3.115-2.053 4.145-.36.509-.754.961-1.168 1.27-.376.282-1.018.624-1.73.361a1.54 1.54 0 0 1-.794-.694 2.6 2.6 0 0 1-.284-.812c-.1-.533-.101-1.178-.042-1.851.057-.648.175-1.372.346-2.132l-.044.014c-1.306.384-3.023.557-4.827.234-1.743-.313-3.315-.91-4.447-1.662-.565-.376-1.062-.818-1.405-1.322-.345-.508-.568-1.138-.45-1.823.12-.685.543-1.203 1.042-1.563.494-.356 1.111-.599 1.769-.755q.465-.11.982-.171a9 9 0 0 1-.333-1.108c-.16-.701-.22-1.395-.137-2.018.082-.613.318-1.26.845-1.71.533-.455 1.194-.574 1.807-.523m9.974 6.615a4 4 0 0 0-.416.466c-.525.681-1.114 1.766-1.641 3.187-.023.082-.05.17-.09.256q-.022.069-.05.134c-.511 1.47-.834 2.936-.932 4.056a7 7 0 0 0-.025.921q.187-.203.417-.525c.597-.843 1.254-2.132 1.802-3.664s.86-2.95.935-3.988c.026-.348.02-.63 0-.843m-11.211.68a7.5 7.5 0 0 0-1.464.18c-.499.119-.848.278-1.063.433-.209.15-.235.254-.24.282-.005.03-.014.14.134.357.151.223.428.495.857.78.856.568 2.155 1.083 3.694 1.36a9 9 0 0 0 1.73.133 8.5 8.5 0 0 1-2.679-2.164c-.362-.44-.686-.897-.97-1.36m2.627.221c.915 1.054 2.008 1.666 2.965 1.927.5.136.941.17 1.284.138q.048-.007.091-.015c-.158-.211-.42-.463-.813-.724-.825-.548-2.062-1.043-3.527-1.326M8.84 5.29c-.253-.021-.33.04-.343.051-.019.017-.116.122-.16.453-.043.321-.02.766.104 1.307.108.472.29.986.537 1.516.522.035 1.06.097 1.605.194 1.293.232 2.492.622 3.487 1.114a10.4 10.4 0 0 0-1.137-1.694c-1.007-1.22-2.096-2.108-3.008-2.577-.458-.236-.825-.343-1.085-.364"
  })
});

export const Password = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M10.5 19.857V16.32l-3.074 2.882a1.5 1.5 0 0 1-2.052-2.19l2.832-2.655H5a1.5 1.5 0 0 1 0-3h3.206L5.374 8.702a1.501 1.501 0 0 1 2.052-2.19L10.5 9.393V5.857a1.5 1.5 0 0 1 3 0v3.536l3.074-2.88a1.5 1.5 0 0 1 2.052 2.189l-2.832 2.655H19a1.5 1.5 0 0 1 0 3h-3.206l2.832 2.656a1.501 1.501 0 0 1-2.052 2.189L13.5 16.32v3.537a1.5 1.5 0 0 1-3 0"
  })
});

export const Pause = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M13.683 5.242A2.08 2.08 0 0 1 15.75 3a2.08 2.08 0 0 1 2.067 2.242C17.674 7.15 17.5 9.906 17.5 12s.174 4.85.317 6.758A2.08 2.08 0 0 1 15.75 21a2.08 2.08 0 0 1-2.067-2.242C13.826 16.85 14 14.094 14 12s-.174-4.85-.317-6.758M6.183 5.242A2.08 2.08 0 0 1 8.25 3a2.08 2.08 0 0 1 2.067 2.242C10.174 7.15 10 9.906 10 12s.174 4.85.317 6.758A2.08 2.08 0 0 1 8.25 21a2.08 2.08 0 0 1-2.067-2.242C6.326 16.85 6.5 14.094 6.5 12s-.174-4.85-.317-6.758"
  })
});

export const Pen = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 5.429c1.828 0 3.159.021 4.034.043.853.021 1.966-.147 1.966-1 0-.156-.032-.294-.081-.413-.222-.539-.874-.69-1.452-.758-.84-.1-2.306-.22-4.467-.22s-3.627.12-4.467.22c-.578.068-1.23.22-1.452.758-.05.12-.081.257-.081.413 0 .853 1.114 1.021 1.966 1A165 165 0 0 1 12 5.429M12 7.429c2.59 0 3.884 0 4.473.355.192.117.26.17.422.324.492.473.681 1.429 1.06 3.012l.71 2.962c.286 1.191.428 1.787.268 2.352-.16.564-.595 1.009-1.468 1.897l-1.958 1.989-.127.13c-.785.798-1.178 1.197-1.675.994s-.497-.789-.497-1.96V16.59c.721-.402 1.208-1.152 1.208-2.013 0-1.285-1.082-2.328-2.416-2.328s-2.416 1.043-2.416 2.328c0 .861.487 1.61 1.208 2.013v2.896c0 1.17 0 1.756-.497 1.96s-.89-.196-1.676-.995l-.128-.13-1.956-1.99c-.873-.887-1.309-1.332-1.468-1.896-.16-.565-.018-1.16.267-2.352l.71-2.962c.38-1.583.57-2.539 1.061-3.012.161-.154.23-.207.423-.324C8.116 7.43 9.41 7.43 12 7.43"
  })
});

export const PenAlt = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.145 14.688a.4.4 0 0 1 .157.054c.229.125.343 1.145.573 3.184l.029.26c.122 1.088.184 1.633-.128 1.966q-.027.029-.057.055c-.337.308-.887.247-1.988.127l-.263-.029c-2.065-.226-3.097-.34-3.223-.566a.4.4 0 0 1-.055-.154c-.044-.254.746-1.036 2.327-2.598s2.371-2.343 2.628-2.299M12.326 8.006a1.19 1.19 0 0 1 1.676-.012c1.7 1.68 2.692 2.933 3.205 3.65.307.43.366.974.111 1.437-.332.602-.958 1.53-2.082 2.64s-2.062 1.729-2.672 2.057c-.468.252-1.018.194-1.454-.11-.725-.507-1.994-1.487-3.694-3.166a1.163 1.163 0 0 1 .012-1.656zM8.494 4.923c.681-.413 1.51-.325 2.151.147.552.406.585 1.207.098 1.688l-4.58 4.526c-.49.484-1.292.451-1.706-.099-.478-.634-.567-1.452-.149-2.126.365-.586.951-1.374 1.873-2.285s1.72-1.49 2.313-1.85"
  })
});

export const Phone = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3.857c1.82 0 3.217.18 4.223.389 1.313.272 2.214 1.337 2.405 2.665.189 1.313.372 3.276.372 5.946s-.183 4.633-.372 5.947c-.19 1.327-1.092 2.393-2.405 2.665-1.005.207-2.403.388-4.223.388s-3.217-.18-4.223-.389c-1.313-.271-2.214-1.337-2.405-2.665C5.183 17.49 5 15.528 5 12.858s.183-4.633.372-5.946c.19-1.328 1.092-2.393 2.405-2.665 1.006-.208 2.403-.389 4.223-.389m0 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0-10c-.713 0-1.275.017-1.695.037C9.668 5.925 9 6.22 9 6.857s.668.932 1.305.963c.42.02.982.037 1.695.037s1.275-.016 1.695-.037C14.332 7.79 15 7.494 15 6.857s-.668-.932-1.305-.963c-.42-.02-.982-.037-1.695-.037",
    clipRule: "evenodd"
  })
});

export const Pie = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M11 12a1 1 0 0 0 1 1h4.477c2.117 0 3.175 0 3.736 1.074s.1 1.738-.824 3.065A9 9 0 1 1 6.862 4.612c1.326-.924 1.99-1.386 3.064-.825S11 5.407 11 7.523z"
  }), /*#__PURE__*/_jsx("path", {
    d: "M13 7.247c0-1.777 0-2.665.823-3.264.112-.082.336-.203.466-.252.95-.362 1.507 0 2.62.726a9.05 9.05 0 0 1 2.634 2.634c.726 1.113 1.088 1.67.726 2.62-.049.13-.17.354-.252.466-.599.823-1.487.823-3.264.823-1.647 0-2.47 0-3.024-.455a2 2 0 0 1-.274-.274C13 9.717 13 8.894 13 7.247"
  })]
});

export const PiggyBank = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M17.09 4.467c.706-.252 1.351.388 1.168 1.114l-.63 2.495q-.007.031.013.054c.412.438.746.951.98 1.516.142.343.509.546.879.546 1.448 0 2.447 1.15 2.491 2.597a19 19 0 0 1 0 1.169c-.044 1.447-1.043 2.596-2.491 2.597q-.266 0-.51-.05a.265.265 0 0 0-.311.187c-.086.332-.243.62-.45.86-.179.207-.28.483-.207.746a2.813 2.813 0 0 1-5.423 1.492l-.106-.379a1.01 1.01 0 0 0-.984-.737 50 50 0 0 1-1.019 0 1.01 1.01 0 0 0-.984.74l-.104.376a2.813 2.813 0 0 1-5.423-1.492c.072-.263-.03-.538-.208-.745a2.1 2.1 0 0 1-.449-.86C3.148 16.014 3 15.09 3 13.903q0-.241.008-.467C3.093 10.923 5.26 9.36 7.77 9.219q.587-.033 1.268-.055c.357-.011.676-.212.883-.503a5 5 0 0 1 3.25-2.037c.278-.046.534-.185.734-.384.819-.809 2.142-1.4 3.185-1.773M9 11.254c-.685 0-1.23.016-1.646.037-.667.033-1.354.354-1.354 1.022 0 .669.687.99 1.354 1.024.415.02.96.037 1.646.037s1.23-.017 1.646-.037c.667-.033 1.354-.355 1.354-1.024 0-.668-.687-.989-1.354-1.022-.415-.02-.96-.037-1.646-.037"
  })
});

export const Pillar = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12 2.429c7.5 0 9.5 3.157 9.5 6.315S18 11.955 18 11.955h-.895c-.61 0-1.105-.495-1.105-1.105a1 1 0 0 0-2 0 3.106 3.106 0 0 0 3.105 3.105H18v3.437c0 1.948 0 2.921-.756 3.773-.602.679-1.223.875-2.244 1.022v-5.021a1 1 0 0 0-2 0v5.232q-.484.03-1 .03t-1-.03v-5.232a1 1 0 0 0-2 0v5.021c-1.021-.147-1.642-.343-2.244-1.022C6 20.313 6 19.34 6 17.392v-3.437h.895A3.106 3.106 0 0 0 10 10.85a1 1 0 0 0-2 0c0 .61-.495 1.105-1.105 1.105H6s-3.5-.053-3.5-3.211 2-6.315 9.5-6.315"
  })
});

export const Placeholder = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M4 17.357a1.5 1.5 0 0 1 1.5 1.5v.5H6a1.5 1.5 0 0 1 0 3H5a2.5 2.5 0 0 1-2.5-2.5v-1a1.5 1.5 0 0 1 1.5-1.5M13 19.357a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 1 0-3zM20 17.357a1.5 1.5 0 0 1 1.5 1.5v1a2.5 2.5 0 0 1-2.5 2.5h-1a1.5 1.5 0 0 1 0-3h.5v-.5a1.5 1.5 0 0 1 1.5-1.5M4 10.357a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-3 0v-2a1.5 1.5 0 0 1 1.5-1.5M20 10.357a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-3 0v-2a1.5 1.5 0 0 1 1.5-1.5M6 3.357a1.5 1.5 0 1 1 0 3h-.5v.5a1.5 1.5 0 0 1-3 0v-1a2.5 2.5 0 0 1 2.5-2.5zM19 3.357a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0v-.5H18a1.5 1.5 0 0 1 0-3zM13 3.357a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 1 0-3z"
  })
});

export const Play = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M6 14.77V9.23c0-3.578 0-5.367 1.126-5.914s2.532.558 5.345 2.769l2.525 1.983c2.305 1.811 3.457 2.717 3.457 3.932s-1.152 2.12-3.457 3.932l-2.525 1.983c-2.813 2.21-4.22 3.316-5.345 2.769S6 18.348 6 14.77"
  })
});

export const Plus = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18m-.018 4.017c-.517 0-.943.394-.995.898l-.005.102v2.984H8a1 1 0 1 0 0 2h2.982v2.98a1 1 0 1 0 2 0v-2.98h2.983l.101-.005a1.001 1.001 0 0 0 0-1.99L15.965 11h-2.983V8.017l-.005-.101a1 1 0 0 0-.995-.899",
    clipRule: "evenodd"
  })
});

export const PrivatePapillonApp = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M12 3c1.483 0 2.748.073 3.805.179 2.723.274 4.743 2.293 5.017 5.015q.048.498.085 1.056l-.072-.03-.116-.038c-.576-.164-1.11.04-1.482.272-.406.255-.78.639-1.116 1.074q-.266.346-.528.771a11.5 11.5 0 0 0-1.723-2.833c-1.068-1.295-2.286-2.319-3.427-2.906-.569-.293-1.165-.5-1.744-.55-.585-.048-1.223.066-1.739.506-.51.435-.736 1.059-.813 1.642-.08.593-.023 1.251.129 1.913q.109.477.288.974a8 8 0 0 0-.85.151c-.623.148-1.21.38-1.682.72-.477.343-.886.84-1 1.504-.115.662.1 1.27.431 1.756.327.48.8.9 1.334 1.255 1.07.711 2.552 1.274 4.192 1.568 1.675.3 3.27.145 4.496-.206a15 15 0 0 0-.304 1.904c-.056.635-.056 1.246.04 1.753q.037.202.108.412c-.954.082-2.062.138-3.329.138-1.483 0-2.749-.072-3.805-.179-2.723-.274-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.073-2.749.179-3.806.274-2.722 2.293-4.741 5.016-5.015A38 38 0 0 1 12 3"
  }), /*#__PURE__*/_jsx("path", {
    d: "M19.994 11.413q.016.263-.01.648c-.071.966-.362 2.289-.874 3.721-.513 1.433-1.127 2.636-1.682 3.42q-.152.213-.284.367-.005-.296.029-.696c.092-1.04.39-2.405.866-3.775q.03-.067.053-.14.056-.127.086-.246c.492-1.323 1.04-2.331 1.527-2.963q.16-.203.29-.336M9.5 11.976c.263.426.561.847.895 1.252a8 8 0 0 0 2.308 1.926 8 8 0 0 1-1.36-.124c-1.436-.257-2.645-.738-3.439-1.265-.398-.265-.65-.514-.787-.714-.132-.194-.117-.281-.116-.29.001-.005.015-.089.201-.224.193-.139.512-.284.974-.394.382-.091.83-.148 1.324-.167M12.17 12.219c1.286.269 2.369.71 3.099 1.196.311.207.533.406.68.578a3.4 3.4 0 0 1-1.156-.128c-.842-.23-1.801-.754-2.624-1.646M10.533 7.004c.233.02.57.116.995.334.845.435 1.86 1.262 2.8 2.4.389.472.706.95.966 1.412a12.6 12.6 0 0 0-3.11-.968c-.5-.09-.995-.149-1.476-.182a7 7 0 0 1-.482-1.374c-.115-.502-.136-.912-.097-1.204.04-.302.129-.385.129-.385a.1.1 0 0 1 .052-.022c.04-.01.111-.02.223-.011"
  })]
});

export const PrivatePapillonIcon = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M9.007 3.01c.605.051 1.232.27 1.834.58 1.207.621 2.5 1.706 3.636 3.083a12.2 12.2 0 0 1 1.88 3.125q.309-.517.624-.927c.356-.462.75-.865 1.174-1.13.389-.244.939-.451 1.528-.283l.118.04.127.053c.611.29.855.907.958 1.335.12.504.136 1.105.09 1.73-.092 1.263-.455 2.862-1.046 4.515-.592 1.652-1.324 3.116-2.053 4.145-.36.51-.754.961-1.168 1.27-.376.282-1.018.625-1.73.361a1.54 1.54 0 0 1-.794-.694 2.6 2.6 0 0 1-.284-.812c-.1-.532-.101-1.177-.042-1.851.057-.647.175-1.372.346-2.132q-.022.007-.044.015c-1.306.384-3.023.557-4.827.233-1.743-.313-3.315-.91-4.447-1.662-.565-.376-1.062-.817-1.405-1.321-.345-.51-.568-1.14-.45-1.824.12-.685.543-1.203 1.042-1.563.494-.356 1.111-.598 1.769-.755q.465-.11.982-.17a9 9 0 0 1-.333-1.11c-.16-.7-.22-1.394-.137-2.017.082-.613.318-1.26.845-1.71.533-.454 1.194-.574 1.807-.523m9.974 6.616a4 4 0 0 0-.416.466c-.525.682-1.114 1.767-1.641 3.187-.023.082-.05.17-.09.256q-.022.069-.05.134c-.511 1.47-.834 2.936-.932 4.057a7 7 0 0 0-.025.92q.187-.203.417-.525c.597-.843 1.254-2.132 1.802-3.664s.86-2.95.935-3.987c.026-.35.02-.63 0-.844m-11.211.68a7.5 7.5 0 0 0-1.464.18c-.499.119-.848.278-1.063.433-.209.15-.235.254-.24.282-.005.03-.014.14.134.358.151.222.428.494.857.779.856.569 2.155 1.083 3.694 1.36a9 9 0 0 0 1.73.133 8.5 8.5 0 0 1-2.679-2.164c-.362-.44-.686-.897-.97-1.36m2.627.221c.915 1.054 2.008 1.667 2.965 1.927.5.136.941.171 1.284.138q.048-.006.091-.015c-.158-.21-.42-.463-.813-.723-.825-.548-2.062-1.044-3.527-1.327M8.84 5.004c-.253-.021-.33.04-.343.052-.019.016-.116.122-.16.452-.043.322-.02.766.104 1.307.108.472.29.986.537 1.516.522.035 1.06.097 1.605.194 1.293.232 2.492.622 3.487 1.115a10.4 10.4 0 0 0-1.137-1.695c-1.007-1.22-2.096-2.108-3.008-2.577-.458-.235-.825-.342-1.085-.364"
  })
});

export const Pronote = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12.114 11.8c1.417-2.712 4.81-3.92 7.842-2.73l.491.196h-.013c.448.178.682.663.51 1.092l-.3.736c-.946 2.314-3.142 3.891-5.695 4.149-.005 0-.249.025-.626.043h-.233q.259.239.472.515c.945 1.208 1.179 2.786.62 4.16l-.153.375c-.184.466-.736.693-1.233.503l-.381-.148c-1.638-.644-2.749-2.116-2.884-3.78 0 0-.258-2.043 1.583-5.11M5.887 4.16c.177-.423.687-.613 1.128-.416l.485.208c2.994 1.282 4.553 4.529 3.651 7.456-.847 3.479-2.473 4.743-2.473 4.743-1.257 1.086-3.093 1.35-4.707.656l-.374-.159h-.005c-.485-.215-.718-.761-.522-1.227l.153-.374c.571-1.375 1.847-2.327 3.363-2.523q.35-.045.699-.037l-.165-.165c-.252-.276-.41-.465-.417-.473C5.07 9.867 4.617 7.204 5.58 4.897z"
  })
});

export const QrCode = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M6.5 13q.565.001 1.048.025c1.913.097 3.33 1.514 3.427 3.427a21 21 0 0 1 0 2.096c-.097 1.913-1.514 3.33-3.427 3.427a21 21 0 0 1-2.096 0c-1.913-.097-3.33-1.514-3.427-3.427a21 21 0 0 1 0-2.096c.097-1.913 1.514-3.33 3.427-3.427Q5.934 13.001 6.5 13m-.063 3c-.821.007-1.43.616-1.437 1.436v.128c.007.82.616 1.429 1.437 1.436h.126c.821-.007 1.43-.616 1.437-1.436v-.128c-.007-.82-.616-1.429-1.437-1.436z",
    clipRule: "evenodd"
  }), /*#__PURE__*/_jsx("path", {
    d: "M15.429 19.007c.87.03 1.571.622 1.571 1.493s-.7 1.463-1.571 1.493a13 13 0 0 1-.858 0c-.87-.03-1.571-.622-1.571-1.493s.7-1.463 1.571-1.493a13 13 0 0 1 .858 0M20.429 19.007c.87.03 1.571.622 1.571 1.493s-.7 1.463-1.571 1.493a13 13 0 0 1-.858 0c-.87-.03-1.571-.622-1.571-1.493s.7-1.463 1.571-1.493a13 13 0 0 1 .858 0M17.5 13c1.07 0 1.913.025 2.543.056.954.046 1.957.489 1.957 1.444 0 .956-1.003 1.398-1.957 1.444-.63.031-1.473.056-2.543.056s-1.912-.025-2.543-.056C14.003 15.898 13 15.455 13 14.5c0-.956 1.003-1.398 1.957-1.444.63-.031 1.473-.056 2.543-.056"
  }), /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M6.5 2q.565.001 1.048.025c1.913.097 3.33 1.514 3.427 3.427a21 21 0 0 1 0 2.096c-.097 1.913-1.514 3.33-3.427 3.427a21 21 0 0 1-2.096 0c-1.913-.097-3.33-1.514-3.427-3.427a21 21 0 0 1 0-2.096c.097-1.913 1.514-3.33 3.427-3.427Q5.934 2.001 6.5 2m-.063 3c-.821.007-1.43.616-1.437 1.437v.126c.007.821.616 1.43 1.437 1.437h.126c.821-.007 1.43-.616 1.437-1.437v-.126C7.993 5.616 7.384 5.007 6.563 5zM17.5 2q.565.001 1.048.025c1.913.097 3.33 1.514 3.427 3.427a21 21 0 0 1 0 2.096c-.097 1.913-1.514 3.33-3.427 3.427a21 21 0 0 1-2.096 0c-1.913-.097-3.33-1.514-3.427-3.427a21 21 0 0 1 0-2.096c.097-1.913 1.514-3.33 3.427-3.427Q16.934 2.001 17.5 2m-.064 3c-.82.007-1.429.616-1.436 1.437v.126c.007.821.616 1.43 1.436 1.437h.128c.82-.007 1.429-.616 1.436-1.437v-.126c-.007-.821-.616-1.43-1.436-1.437z",
    clipRule: "evenodd"
  })]
});

export const Search = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M10 3a7 7 0 0 1 5.573 11.232l4.078 3.548c1.28 1.114.492 3.22-1.205 3.22a1.84 1.84 0 0 1-1.43-.685l-3.453-4.29A7 7 0 1 1 10 3m0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    clipRule: "evenodd"
  })
});

export const Skolengo = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 2.286c2.399 0 4.6.85 6.323 2.26l.037-.036 1.414 1.415-.037.037a10 10 0 0 1 2.044 4.263l.001.001q.002.01.003.019l.009.037v.014a10.022 10.022 0 0 1-6.262 11.39l.015.05-1.93.517-.015-.05a10 10 0 0 1-4.705-.363l-.036-.012-.018-.006-.005-.003a10.02 10.02 0 0 1-6.704-11.145l-.047-.013.258-.961v-.004l.26-.968.05.014c.57-1.5 1.488-2.829 2.657-3.883l.043-.039.012-.01A9.95 9.95 0 0 1 12 2.286M8.504 16.902c-.01.267-.018.526-.014.796.009.628.081 1.094.244 1.448.14.303.371.576.826.8l.02.01a7.96 7.96 0 0 0 3.557.296l-.001-.002-.009-.067a9 9 0 0 1-.096-.87l-.005-.142a7 7 0 0 1-.005-.33v-.048q.006-.42.063-.808a5.718 5.718 0 0 1-4.58-1.083M12 8.531a3.773 3.773 0 0 0-3.66 4.657l.003.008a3.77 3.77 0 0 0 3.656 2.894 3.74 3.74 0 0 0 2.597-1.048l.002-.001c.024-.024.05-.048.061-.057l.017-.016a3.77 3.77 0 0 0 1.09-2.658 3.78 3.78 0 0 0-2.63-3.604l-.009-.002-.003-.001-.035-.009-.057-.016A3.8 3.8 0 0 0 12 8.531m6.148-1.08-.144.114a9 9 0 0 1-.45.321l-.1.064a7 7 0 0 1-.64.365q-.072.035-.144.068l-.17.077q-.074.032-.148.062a5.76 5.76 0 0 1 1.366 4.518c.255-.135.497-.267.737-.412a6 6 0 0 0 .517-.35q.299-.226.485-.456.047-.058.087-.116.108-.154.179-.346a1.9 1.9 0 0 0 .088-.784 8 8 0 0 0-1.529-3.23zM7.57 6.059q-.12 0-.249.02c-.205.036-.424.12-.666.276l-.06.04a8 8 0 0 0-2.019 2.923l.073.03q.173.066.336.137l.107.048q.18.081.351.168.05.026.1.054.126.067.245.135l.111.065a7 7 0 0 1 .655.454 5.8 5.8 0 0 1 3.21-3.427q-.163-.103-.326-.202a12 12 0 0 0-.359-.209 7 7 0 0 0-.57-.283 2.6 2.6 0 0 0-.794-.222 2 2 0 0 0-.13-.007z",
    clipRule: "evenodd"
  })
});

export const Sparkles = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12.647 16.859c-1.087 2.185-1.63 3.278-2.412 3.543a2 2 0 0 1-1.284 0c-.782-.265-1.325-1.358-2.412-3.543-1.156-.202-1.735-.302-1.876-.35-1.888-.626-1.801-3.326.123-3.831.144-.038.68-.097 1.753-.213 1.064-2.252 1.596-3.378 2.365-3.66a2 2 0 0 1 1.378 0c.77.282 1.301 1.408 2.365 3.66 1.176.114 1.765.172 1.91.208 1.958.49 2.038 3.246.11 3.849-.142.044-.768.142-2.02.337M14.294 9.114l-.25-.14c-.944-.531-1.416-.796-1.549-1.114a1 1 0 0 1 .081-.925c.186-.29.697-.47 1.718-.827.768-1.43 1.152-2.146 1.682-2.343a1.5 1.5 0 0 1 1.047 0c.53.197.915.912 1.683 2.343 1.021.358 1.532.537 1.718.827a1 1 0 0 1 .08.925c-.132.318-.604.583-1.547 1.113l-.251.141c-.79 1.39-1.184 2.085-1.726 2.269a1.5 1.5 0 0 1-.96 0c-.542-.183-.937-.879-1.726-2.269"
  })
});

export const Star = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "m7.82 8.84-1.563 5.203L12 17.68l5.744-3.637L16.18 8.84z"
  }), /*#__PURE__*/_jsx("path", {
    d: "M12 17.68c2.723 2.55 4.084 3.826 5.08 3.639a2 2 0 0 0 1.091-.6c.693-.74.347-2.573-.345-6.239l-.082-.437z"
  }), /*#__PURE__*/_jsx("path", {
    d: "m16.18 8.84 1.564 5.203c2.305-1.066 3.459-1.599 3.76-2a2 2 0 0 0-.651-2.965c-.443-.238-1.713-.238-4.254-.238zM7.82 8.84h8.36l-.564-1.192C14.05 4.335 13.266 2.68 12 2.68s-2.05 1.656-3.616 4.97zM6.174 14.48c-.692 3.666-1.038 5.499-.345 6.24a2 2 0 0 0 1.09.599c.997.187 2.359-1.088 5.081-3.639l-5.743-3.637zM6.257 14.043 7.82 8.84h-.419c-2.54 0-3.81 0-4.254.238a2 2 0 0 0-.652 2.965c.302.401 1.455.934 3.762 2"
  })]
});

export const Sun = props => /*#__PURE__*/_jsxs("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: [/*#__PURE__*/_jsx("path", {
    d: "M15 12.857a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
  }), /*#__PURE__*/_jsx("path", {
    d: "M12 9.857a3 3 0 1 1 0 6 3 3 0 0 1 0-6"
  }), /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12.224 2.713c.974.11 1.65 1.22 3.004 3.441 2.58-.326 3.87-.49 4.563.202q.16.16.28.352c.52.83.075 2.05-.818 4.493 1.864 1.814 2.796 2.72 2.687 3.694q-.025.225-.1.438c-.323.925-1.557 1.338-4.023 2.163-.256 2.588-.385 3.882-1.214 4.403q-.191.12-.403.195c-.925.323-2.018-.384-4.2-1.797-2.183 1.413-3.275 2.12-4.2 1.797a2 2 0 0 1-.404-.195c-.83-.521-.957-1.815-1.213-4.403-2.466-.825-3.7-1.238-4.023-2.163a2 2 0 0 1-.1-.438c-.11-.973.823-1.88 2.687-3.694-.893-2.442-1.339-3.663-.818-4.493q.12-.192.28-.352c.692-.692 1.983-.528 4.563-.202 1.353-2.22 2.03-3.331 3.004-3.441a2 2 0 0 1 .448 0m-.225 5.144a5 5 0 1 0 .001 10 5 5 0 0 0 0-10",
    clipRule: "evenodd"
  })]
});

export const Sunrise = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M15.228 8.154c2.58-.326 3.87-.49 4.563.203q.16.16.28.351c.521.83.075 2.051-.818 4.494.189.183.283.275.334.333 1.091 1.238.298 3.19-1.347 3.316-.077.006-.208.006-.471.006h-.476c-.108 0-.162 0-.191-.004-.233-.035-.367-.21-.338-.444.003-.03.02-.093.056-.22a5 5 0 1 0-9.64 0c.035.127.053.19.057.22.028.234-.105.409-.338.444-.03.004-.084.004-.192.004h-.476c-.263 0-.394 0-.47-.006-1.646-.126-2.44-2.078-1.348-3.316.05-.058.145-.15.334-.333-.893-2.443-1.34-3.664-.818-4.494a2 2 0 0 1 .28-.35c.692-.693 1.983-.53 4.563-.204 1.354-2.22 2.03-3.331 3.004-3.44a2 2 0 0 1 .449 0c.973.11 1.65 1.22 3.003 3.44m-3.227 3.703a3 3 0 0 1 2.759 4.175c-.101.235-.152.353-.502.655-.35.301-.555.355-.965.463-.415.11-.897.207-1.292.207-.396 0-.879-.098-1.294-.207-.41-.108-.615-.162-.965-.464s-.4-.42-.501-.654A3 3 0 0 1 12 11.858M12 21.857c2.774 0 4.69-.053 5.827-.1.85-.035 1.864-.193 2.114-1.006a1.33 1.33 0 0 0 0-.788c-.25-.812-1.264-.971-2.114-1.006-1.138-.046-3.053-.1-5.827-.1s-4.69.054-5.827.1c-.85.035-1.864.194-2.115 1.006a1.33 1.33 0 0 0 0 .788c.25.813 1.265.971 2.115 1.006 1.138.046 3.053.1 5.827.1"
  })
});

export const Tasks = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12 3c1.483 0 2.748.073 3.805.179 2.723.274 4.743 2.293 5.017 5.015C20.928 9.251 21 10.517 21 12s-.072 2.748-.178 3.805c-.274 2.723-2.294 4.743-5.017 5.016a38 38 0 0 1-3.805.18c-1.483 0-2.749-.073-3.805-.18-2.723-.274-4.742-2.293-5.016-5.016A38 38 0 0 1 3 12c0-1.483.073-2.749.179-3.806.274-2.722 2.293-4.741 5.016-5.015A38 38 0 0 1 12 3m5.63 4.223a1 1 0 0 0-1.407.148l-5.773 7.136-2.213-2.214-.077-.068a1 1 0 0 0-1.338 1.482l2.214 2.214a2 2 0 0 0 2.97-.156l5.772-7.136a1 1 0 0 0-.149-1.406",
    clipRule: "evenodd"
  })
});

export const TextBubble = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    fillRule: "evenodd",
    d: "M12.5 3q.637 0 1.218.018c4.103.123 7.14 3.16 7.264 7.264a41 41 0 0 1 0 2.436c-.123 4.103-3.16 7.141-7.264 7.264a41 41 0 0 1-2.437 0 8 8 0 0 1-2.01-.313c-.495-.144-1.104.02-1.584.208-.312.122-.722.243-1.245.396-1.301.383-1.952.573-2.348.291a1 1 0 0 1-.234-.233c-.283-.396-.09-1.047.292-2.349.148-.505.266-.905.383-1.213.157-.41.215-.902.05-1.309a7.9 7.9 0 0 1-.567-2.742 41 41 0 0 1 0-2.436c.123-4.103 3.16-7.141 7.264-7.264A41 41 0 0 1 12.5 3m-5 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3",
    clipRule: "evenodd"
  })
});

export const Trash = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M14.876 10.29c2.406-.085 3.608-.127 4.233.586.626.713.433 1.87.047 4.187l-.321 1.923c-.4 2.395-.598 3.592-1.437 4.303S15.344 22 12.917 22h-1.835c-2.427 0-3.641 0-4.48-.71-.84-.712-1.039-1.91-1.438-4.304l-.32-1.924c-.386-2.315-.58-3.473.046-4.186.625-.713 1.828-.67 4.234-.587.934.033 1.917.054 2.876.054s1.942-.021 2.876-.054M8.5 12a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1m3.5 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1m3.5 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1M12 2c1.275 0 2.271.276 2.97.854.722.597.978 1.388 1.022 2.083.024.376-.013.74-.073 1.063h2.73C19.395 6 20 6.605 20 7.35c0 .663-.48 1.224-1.138 1.297C17.547 8.795 15.151 9 12 9c-3.15 0-5.546-.205-6.862-.353A1.29 1.29 0 0 1 4 7.351C4 6.605 4.605 6 5.35 6h2.731a4.3 4.3 0 0 1-.073-1.063c.044-.695.3-1.486 1.021-2.083C9.73 2.276 10.725 2 12 2m0 2c-1.018 0-1.488.224-1.696.396-.186.153-.28.362-.3.667-.02.302.043.638.133.937h3.726c.09-.3.152-.635.133-.937-.02-.305-.114-.514-.3-.667C13.488 4.224 13.018 4 12 4"
  })
});

export const Underline = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M5 19.802c0-.967.784-1.75 1.75-1.75h10.5a1.75 1.75 0 1 1 0 3.5H6.75A1.75 1.75 0 0 1 5 19.802M11.853 16.643q-1.845 0-3.418-.957a7.2 7.2 0 0 1-2.512-2.563A7.04 7.04 0 0 1 5 9.585l.068-5.25c0-1.085 1-1.887 2.102-1.887 1.103 0 2.102.802 2.102 1.887v5.25q0 1.179.752 2.017.752.82 1.829.82 1.128 0 1.88-.82.752-.837.752-2.017l.017-5.25c0-1.085.999-1.887 2.102-1.887s2.102.802 2.102 1.887l.051 5.25a7.07 7.07 0 0 1-.923 3.555 7.3 7.3 0 0 1-2.495 2.563q-1.555.94-3.486.94"
  })
});

export const Unlock = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M12.324 3.866c2.168.112 3.853 1.344 4.797 3.13.477.903-.294 1.861-1.315 1.861-.673 0-1.24-.45-1.665-.973A2.72 2.72 0 0 0 12 6.857c-1.497 0-2.872 1.172-2.962 3.474q-.026.707-.033 1.526h8.99v.037c.656.044 1.117.142 1.505.365a3 3 0 0 1 1.098 1.098c.402.696.402 1.63.402 3.5s0 2.804-.402 3.5a3 3 0 0 1-1.098 1.098c-.696.402-1.63.402-3.5.402H8c-1.87 0-2.804 0-3.5-.402a3 3 0 0 1-1.098-1.098C3 19.661 3 18.727 3 16.857s0-2.804.402-3.5A3 3 0 0 1 4.5 12.26c.387-.223.849-.32 1.504-.365q.002-.336.007-.655l.029-1.024C6.176 6.72 8.503 3.857 12 3.857z"
  })
});

export const User = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0M4.345 18.582c.052-.358.077-.537.094-.628.41-2.155 2.06-3.414 4.247-3.24.091.008.35.04.868.105.85.107 1.705.181 2.446.181s1.595-.073 2.446-.18c.518-.066.777-.098.868-.106 2.187-.174 3.837 1.085 4.247 3.24.017.09.042.27.094.628.017.124.026.185.03.236a2 2 0 0 1-1.89 2.18c-.05.002-.113.002-.238.002H6.444c-.125 0-.188 0-.238-.003a2 2 0 0 1-1.89-2.18c.004-.05.013-.111.03-.235"
  })
});

export const UserCross = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M20.127 13c.312 0 .625.137.86.373.236.236.374.548.374.86s-.138.596-.373.801l-.16.139-2.31 2.007 2.31 2.006.16.14c.235.204.373.49.373.801s-.138.624-.373.86c-.236.235-.55.373-.86.372-.312 0-.598-.137-.802-.373l-.14-.159-2.006-2.308q-1.003 1.155-2.006 2.308l-.138.16c-.205.235-.49.372-.802.372-.311 0-.625-.137-.86-.373a1.23 1.23 0 0 1-.374-.859c0-.312.137-.597.373-.802l.16-.139 2.308-2.006-2.308-2.007-.16-.139a1.06 1.06 0 0 1-.373-.802c0-.31.138-.623.373-.859.236-.236.55-.373.86-.373.312 0 .598.137.803.373l.138.16 2.006 2.306 2.007-2.307.139-.159c.204-.236.49-.373.801-.373M3.44 17.954c.41-2.155 2.06-3.414 4.247-3.24.092.007.352.04.868.105.85.107 1.705.181 2.446.181l.096-.003c.145.557.444 1.051.847 1.439l.118.108.077.067.081.07q.286.25.573.499l-.573.498-.081.07-.077.067A3.05 3.05 0 0 0 11.126 21H5.444c-.125 0-.188 0-.239-.003a2 2 0 0 1-1.89-2.18 19.092 19.092 0 0 1 .125-.863M11.001 3a5 5 0 0 1 5 5c0 1.163-.4 2.233-1.066 3.082a3 3 0 0 0-.7-.081h-.002c-.892 0-1.7.385-2.274.958-.29.29-.533.642-.702 1.034A5 5 0 1 1 11.001 3"
  })
});

export const Volume = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M9.443 3.922a2 2 0 0 1 1.965.5C12 5.01 12 6.85 12 10.53v2.94c0 3.68 0 5.52-.592 6.107a2 2 0 0 1-1.965.501c-.724-.21-1.514-1.552-2.964-4.2A1.69 1.69 0 0 0 5 15c-.932 0-1.398 0-1.766-.152a2 2 0 0 1-1.082-1.082C2 13.398 2 12.932 2 12s0-1.398.152-1.766a2 2 0 0 1 1.082-1.082C3.602 9 4.068 9 5 9c.616 0 1.183-.337 1.48-.878 1.449-2.647 2.24-3.99 2.963-4.2M18.256 4.996a1.25 1.25 0 0 1 1.748.26A11.3 11.3 0 0 1 22.25 12c0 2.513-.835 4.84-2.246 6.744a1.25 1.25 0 1 1-2.008-1.488A8.8 8.8 0 0 0 19.75 12a8.8 8.8 0 0 0-1.754-5.256 1.25 1.25 0 0 1 .26-1.748M14.256 7.996a1.25 1.25 0 0 1 1.748.26A6.27 6.27 0 0 1 17.25 12c0 1.398-.465 2.69-1.246 3.744a1.25 1.25 0 1 1-2.008-1.488c.48-.647.754-1.423.754-2.256s-.274-1.609-.754-2.256a1.25 1.25 0 0 1 .26-1.748"
  })
});

export const VolumeCross = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M9.443 3.922a2 2 0 0 1 1.965.501C12 5.01 12 6.85 12 10.529v2.94c0 3.68 0 5.52-.592 6.107a2 2 0 0 1-1.965.501c-.724-.21-1.514-1.552-2.964-4.199A1.69 1.69 0 0 0 5 15c-.932 0-1.398 0-1.766-.152a2 2 0 0 1-1.082-1.082C2 13.398 2 12.932 2 12s0-1.398.152-1.765a2 2 0 0 1 1.082-1.083C3.602 9 4.068 9 5 9c.616 0 1.183-.337 1.48-.878 1.449-2.647 2.24-3.99 2.963-4.2M20.559 8c.31 0 .625.139.862.376s.375.551.375.862c0 .312-.138.596-.375.8q-.075.062-.148.126-1.036.89-2.073 1.78l2.073 1.78.148.128c.237.203.375.487.375.798s-.138.626-.375.863a1.24 1.24 0 0 1-.862.376c-.312 0-.597-.139-.8-.376l-.126-.148-1.781-2.073q-.89 1.036-1.78 2.073l-.127.148a1.05 1.05 0 0 1-.8.376 1.24 1.24 0 0 1-.862-.376 1.24 1.24 0 0 1-.375-.863c0-.311.138-.595.375-.798l.148-.127 2.072-1.78-2.072-1.78-.148-.128a1.05 1.05 0 0 1-.375-.799c0-.31.138-.625.375-.862S14.834 8 15.146 8s.596.139.8.376l.125.148 1.78 2.072 1.782-2.072.126-.148c.203-.237.488-.376.8-.376"
  })
});

export const VolumeHalf = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M9.443 3.922a2 2 0 0 1 1.965.5C12 5.01 12 6.85 12 10.53v2.94c0 3.68 0 5.52-.592 6.107a2 2 0 0 1-1.965.501c-.724-.21-1.514-1.552-2.964-4.2A1.69 1.69 0 0 0 5 15c-.932 0-1.398 0-1.766-.152a2 2 0 0 1-1.082-1.082C2 13.398 2 12.932 2 12s0-1.398.152-1.766a2 2 0 0 1 1.082-1.082C3.602 9 4.068 9 5 9c.616 0 1.183-.337 1.48-.878 1.449-2.647 2.24-3.99 2.963-4.2M14.256 7.996a1.25 1.25 0 0 1 1.748.26A6.27 6.27 0 0 1 17.25 12c0 1.398-.465 2.69-1.246 3.744a1.25 1.25 0 1 1-2.008-1.488c.48-.647.754-1.423.754-2.256s-.274-1.609-.754-2.256a1.25 1.25 0 0 1 .26-1.748"
  })
});

export const VolumeNo = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M9.443 3.922a2 2 0 0 1 1.965.5C12 5.01 12 6.85 12 10.53v2.94c0 3.68 0 5.52-.592 6.107a2 2 0 0 1-1.965.501c-.724-.21-1.514-1.552-2.964-4.2A1.69 1.69 0 0 0 5 15c-.932 0-1.398 0-1.766-.152a2 2 0 0 1-1.082-1.082C2 13.398 2 12.932 2 12s0-1.398.152-1.766a2 2 0 0 1 1.082-1.082C3.602 9 4.068 9 5 9c.616 0 1.183-.337 1.48-.878 1.449-2.647 2.24-3.99 2.963-4.2"
  })
});

export const Walk = props => /*#__PURE__*/_jsx("svg", {
  viewBox: "0 0 24 24",
  width: props.size ?? props.width ?? 24,
  height: props.size ?? props.height ?? 24,
  fill: props.color ?? props.fill ?? 'currentColor',
  style: {
    opacity: props.opacity ?? 1,
    ...props.style
  },
  ...props,
  children: /*#__PURE__*/_jsx("path", {
    d: "M19.916 17.633c.533-.079 1.04.167 1.254.661.103.238.213.54.313.914.3 1.119-.375 2.131-1.484 2.463a15 15 0 0 1-.829.222c-1.126.267-2.217-.272-2.517-1.39a6.6 6.6 0 0 1-.185-.949c-.062-.535.254-1.001.755-1.2.326-.128.764-.279 1.328-.43a12 12 0 0 1 1.365-.29M4.149 12.633c.346.052.802.14 1.366.291s1.002.302 1.328.43c.5.199.816.665.755 1.2-.03.258-.086.575-.187.95-.3 1.117-1.39 1.656-2.516 1.389a15 15 0 0 1-.828-.222c-1.11-.332-1.784-1.344-1.485-2.463.1-.373.21-.675.314-.914.214-.494.72-.74 1.253-.66M15.704 7.3c1.96-.526 3.724.672 4.31 2.614a27 27 0 0 1 .445 1.658c.463 1.975-.466 3.896-2.426 4.42-1.96.525-3.723-.673-4.31-2.615a27 27 0 0 1-.445-1.658c-.462-1.975.467-3.895 2.426-4.42M4.05 4.914c.588-1.942 2.352-3.14 4.311-2.615s2.89 2.445 2.426 4.42a27 27 0 0 1-.444 1.658c-.587 1.942-2.351 3.14-4.31 2.615-1.96-.525-2.89-2.445-2.426-4.42a27 27 0 0 1 .444-1.658"
  })
});

