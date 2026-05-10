var e = Object.defineProperty;
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/ const t = Symbol("Comlink.proxy"), n = Symbol("Comlink.endpoint"), r = Symbol("Comlink.releaseProxy"), a = Symbol("Comlink.finalizer"), o = Symbol("Comlink.thrown"), i = (e) => "object" == typeof e && null !== e || "function" == typeof e, s = new Map([["proxy", {
	canHandle: (e) => i(e) && e[t],
	serialize(e) {
		const { port1: t, port2: n } = new MessageChannel();
		return c(e, t), [n, [n]];
	},
	deserialize: (e) => (e.start(), function(e) {
		const t = /* @__PURE__ */ new Map();
		return e.addEventListener("message", function(e) {
			const { data: n } = e;
			if (!n || !n.id) return;
			const r = t.get(n.id);
			if (r) try {
				r(n);
			} finally {
				t.delete(n.id);
			}
		}), m(e, t, [], void 0);
	}(e))
}], ["throw", {
	canHandle: (e) => i(e) && o in e,
	serialize({ value: e }) {
		let t;
		return t = e instanceof Error ? {
			isError: !0,
			value: {
				message: e.message,
				name: e.name,
				stack: e.stack
			}
		} : {
			isError: !1,
			value: e
		}, [t, []];
	},
	deserialize(e) {
		if (e.isError) throw Object.assign(new Error(e.value.message), e.value);
		throw e.value;
	}
}]]);
function c(e, n = globalThis, r = ["*"]) {
	n.addEventListener("message", function i(s) {
		if (!s || !s.data) return;
		if (!function(e, t) {
			for (const n of e) {
				if (t === n || "*" === n) return !0;
				if (n instanceof RegExp && n.test(t)) return !0;
			}
			return !1;
		}(r, s.origin)) return void console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
		const { id: l, type: f, path: p } = Object.assign({ path: [] }, s.data), g = (s.data.argumentList || []).map(b);
		let m;
		try {
			const n = p.slice(0, -1).reduce((e, t) => e[t], e), r = p.reduce((e, t) => e[t], e);
			switch (f) {
				case "GET":
					m = r;
					break;
				case "SET":
					n[p.slice(-1)[0]] = b(s.data.value), m = !0;
					break;
				case "APPLY":
					m = r.apply(n, g);
					break;
				case "CONSTRUCT":
					m = function(e) {
						return Object.assign(e, { [t]: !0 });
					}(new r(...g));
					break;
				case "ENDPOINT":
					{
						const { port1: t, port2: n } = new MessageChannel();
						c(e, n), m = function(e, t) {
							return y.set(e, t), e;
						}(t, [t]);
					}
					break;
				case "RELEASE":
					m = void 0;
					break;
				default: return;
			}
		} catch (e) {
			m = {
				value: e,
				[o]: 0
			};
		}
		Promise.resolve(m).catch((e) => ({
			value: e,
			[o]: 0
		})).then((t) => {
			const [r, o] = h(t);
			n.postMessage(Object.assign(Object.assign({}, r), { id: l }), o), "RELEASE" === f && (n.removeEventListener("message", i), u(n), a in e && "function" == typeof e[a] && e[a]());
		}).catch((e) => {
			const [t, r] = h({
				value: /* @__PURE__ */ new TypeError("Unserializable return value"),
				[o]: 0
			});
			n.postMessage(Object.assign(Object.assign({}, t), { id: l }), r);
		});
	}), n.start && n.start();
}
function u(e) {
	(function(e) {
		return "MessagePort" === e.constructor.name;
	})(e) && e.close();
}
function l(e) {
	if (e) throw new Error("Proxy has been released and is not useable");
}
function f(e) {
	return E(e, /* @__PURE__ */ new Map(), { type: "RELEASE" }).then(() => {
		u(e);
	});
}
const p = /* @__PURE__ */ new WeakMap(), g = "FinalizationRegistry" in globalThis && new FinalizationRegistry((e) => {
	const t = (p.get(e) || 0) - 1;
	p.set(e, t), 0 === t && f(e);
});
function m(e, t, a = [], o = function() {}) {
	let i = !1;
	const s = new Proxy(o, {
		get(n, o) {
			if (l(i), o === r) return () => {
				(function(e) {
					g && g.unregister(e);
				})(s), f(e), t.clear(), i = !0;
			};
			if ("then" === o) {
				if (0 === a.length) return { then: () => s };
				const n = E(e, t, {
					type: "GET",
					path: a.map((e) => e.toString())
				}).then(b);
				return n.then.bind(n);
			}
			return m(e, t, [...a, o]);
		},
		set(n, r, o) {
			l(i);
			const [s, c] = h(o);
			return E(e, t, {
				type: "SET",
				path: [...a, r].map((e) => e.toString()),
				value: s
			}, c).then(b);
		},
		apply(r, o, s) {
			l(i);
			const c = a[a.length - 1];
			if (c === n) return E(e, t, { type: "ENDPOINT" }).then(b);
			if ("bind" === c) return m(e, t, a.slice(0, -1));
			const [u, f] = d(s);
			return E(e, t, {
				type: "APPLY",
				path: a.map((e) => e.toString()),
				argumentList: u
			}, f).then(b);
		},
		construct(n, r) {
			l(i);
			const [o, s] = d(r);
			return E(e, t, {
				type: "CONSTRUCT",
				path: a.map((e) => e.toString()),
				argumentList: o
			}, s).then(b);
		}
	});
	return function(e, t) {
		const n = (p.get(t) || 0) + 1;
		p.set(t, n), g && g.register(e, t, e);
	}(s, e), s;
}
function d(e) {
	const t = e.map(h);
	return [t.map((e) => e[0]), (n = t.map((e) => e[1]), Array.prototype.concat.apply([], n))];
	var n;
}
const y = /* @__PURE__ */ new WeakMap();
function h(e) {
	for (const [t, n] of s) if (n.canHandle(e)) {
		const [r, a] = n.serialize(e);
		return [{
			type: "HANDLER",
			name: t,
			value: r
		}, a];
	}
	return [{
		type: "RAW",
		value: e
	}, y.get(e) || []];
}
function b(e) {
	switch (e.type) {
		case "HANDLER": return s.get(e.name).deserialize(e.value);
		case "RAW": return e.value;
	}
}
function E(e, t, n, r) {
	return new Promise((a) => {
		const o = new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
		t.set(o, a), e.start && e.start(), e.postMessage(Object.assign({ id: o }, n), r);
	});
}
function v(e, t) {
	return e.filter(function(e) {
		return -1 == t.indexOf(e);
	});
}
function w(e, t) {
	return e.filter(function(e) {
		return t.indexOf(e) > -1;
	});
}
function S(e) {
	return +(80955.31 / (1 + Math.pow(e / 91610.74, 7096758e-11)) - 40467.74).toFixed(1);
}
c(((t, n) => {
	let r = {};
	for (var a in t) e(r, a, {
		get: t[a],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
})({
	getIntersect: () => w,
	getMinus: () => v,
	getZoomLevel: () => S
}));
