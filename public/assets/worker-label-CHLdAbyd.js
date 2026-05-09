var e = Object.defineProperty;
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/ const t = Symbol("Comlink.proxy"), n = Symbol("Comlink.endpoint"), r = Symbol("Comlink.releaseProxy"), a = Symbol("Comlink.finalizer"), o = Symbol("Comlink.thrown"), s = (e) => "object" == typeof e && null !== e || "function" == typeof e, i = new Map([["proxy", {
	canHandle: (e) => s(e) && e[t],
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
		}), h(e, t, [], void 0);
	}(e))
}], ["throw", {
	canHandle: (e) => s(e) && o in e,
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
	n.addEventListener("message", function s(i) {
		if (!i || !i.data) return;
		if (!function(e, t) {
			for (const n of e) {
				if (t === n || "*" === n) return !0;
				if (n instanceof RegExp && n.test(t)) return !0;
			}
			return !1;
		}(r, i.origin)) return void console.warn(`Invalid origin '${i.origin}' for comlink proxy`);
		const { id: l, type: f, path: p } = Object.assign({ path: [] }, i.data), g = (i.data.argumentList || []).map(b);
		let h;
		try {
			const n = p.slice(0, -1).reduce((e, t) => e[t], e), r = p.reduce((e, t) => e[t], e);
			switch (f) {
				case "GET":
					h = r;
					break;
				case "SET":
					n[p.slice(-1)[0]] = b(i.data.value), h = !0;
					break;
				case "APPLY":
					h = r.apply(n, g);
					break;
				case "CONSTRUCT":
					h = function(e) {
						return Object.assign(e, { [t]: !0 });
					}(new r(...g));
					break;
				case "ENDPOINT":
					{
						const { port1: t, port2: n } = new MessageChannel();
						c(e, n), h = function(e, t) {
							return d.set(e, t), e;
						}(t, [t]);
					}
					break;
				case "RELEASE":
					h = void 0;
					break;
				default: return;
			}
		} catch (e) {
			h = {
				value: e,
				[o]: 0
			};
		}
		Promise.resolve(h).catch((e) => ({
			value: e,
			[o]: 0
		})).then((t) => {
			const [r, o] = y(t);
			n.postMessage(Object.assign(Object.assign({}, r), { id: l }), o), "RELEASE" === f && (n.removeEventListener("message", s), u(n), a in e && "function" == typeof e[a] && e[a]());
		}).catch((e) => {
			const [t, r] = y({
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
function h(e, t, a = [], o = function() {}) {
	let s = !1;
	const i = new Proxy(o, {
		get(n, o) {
			if (l(s), o === r) return () => {
				(function(e) {
					g && g.unregister(e);
				})(i), f(e), t.clear(), s = !0;
			};
			if ("then" === o) {
				if (0 === a.length) return { then: () => i };
				const n = E(e, t, {
					type: "GET",
					path: a.map((e) => e.toString())
				}).then(b);
				return n.then.bind(n);
			}
			return h(e, t, [...a, o]);
		},
		set(n, r, o) {
			l(s);
			const [i, c] = y(o);
			return E(e, t, {
				type: "SET",
				path: [...a, r].map((e) => e.toString()),
				value: i
			}, c).then(b);
		},
		apply(r, o, i) {
			l(s);
			const c = a[a.length - 1];
			if (c === n) return E(e, t, { type: "ENDPOINT" }).then(b);
			if ("bind" === c) return h(e, t, a.slice(0, -1));
			const [u, f] = m(i);
			return E(e, t, {
				type: "APPLY",
				path: a.map((e) => e.toString()),
				argumentList: u
			}, f).then(b);
		},
		construct(n, r) {
			l(s);
			const [o, i] = m(r);
			return E(e, t, {
				type: "CONSTRUCT",
				path: a.map((e) => e.toString()),
				argumentList: o
			}, i).then(b);
		}
	});
	return function(e, t) {
		const n = (p.get(t) || 0) + 1;
		p.set(t, n), g && g.register(e, t, e);
	}(i, e), i;
}
function m(e) {
	const t = e.map(y);
	return [t.map((e) => e[0]), (n = t.map((e) => e[1]), Array.prototype.concat.apply([], n))];
	var n;
}
const d = /* @__PURE__ */ new WeakMap();
function y(e) {
	for (const [t, n] of i) if (n.canHandle(e)) {
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
	}, d.get(e) || []];
}
function b(e) {
	switch (e.type) {
		case "HANDLER": return i.get(e.name).deserialize(e.value);
		case "RAW": return e.value;
	}
}
function E(e, t, n, r) {
	return new Promise((a) => {
		const o = new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
		t.set(o, a), e.start && e.start(), e.postMessage(Object.assign({ id: o }, n), r);
	});
}
function v(e, t, n = 0) {
	const r = 6378137, a = 6356752.314245179, o = r * r, s = a * a;
	e *= Math.PI / 180, t *= Math.PI / 180;
	const i = Math.cos(t), c = i * Math.cos(e), u = i * Math.sin(e), l = Math.sin(t);
	let f = o * c, p = o * u, g = s * l;
	const h = Math.sqrt(c * f + u * p + l * g);
	return f /= h, p /= h, g /= h, {
		x: f + c * n,
		y: p + u * n,
		z: g + l * n
	};
}
async function w(e, t, n) {
	let r = await (await fetch(e)).json();
	if (r) return function(e, t, n) {
		const r = e.features, a = [];
		if (r) for (let o = 0; o < r.length; o++) {
			const e = r[o], s = e.properties;
			if (s) {
				const r = s[t], o = s[n];
				if (r) {
					const t = e.geometry.coordinates;
					if (t) {
						const e = {
							position: v(t[0], t[1], 0),
							fieldText: r,
							filterText: o
						};
						a.push(e);
					}
				}
			}
		}
		return a;
	}(r, t, n);
}
c(((t, n) => {
	let r = {};
	for (var a in t) e(r, a, {
		get: t[a],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
})({ loadLabelPoints: () => w }));
