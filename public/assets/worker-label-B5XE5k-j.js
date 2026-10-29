var e = Object.defineProperty;
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/ const t = Symbol("Comlink.proxy"), n = Symbol("Comlink.endpoint"), r = Symbol("Comlink.releaseProxy"), a = Symbol("Comlink.finalizer"), i = Symbol("Comlink.thrown"), o = (e) => "object" == typeof e && null !== e || "function" == typeof e, s = /* @__PURE__ */ new Map([["proxy", {
	canHandle: (e) => o(e) && e[t],
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
		}), g(e, t, [], void 0);
	}(e))
}], ["throw", {
	canHandle: (e) => o(e) && i in e,
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
	n.addEventListener("message", function o(s) {
		if (!s || !s.data) return;
		if (!function(e, t) {
			for (const n of e) {
				if (t === n || "*" === n) return !0;
				if (n instanceof RegExp && n.test(t)) return !0;
			}
			return !1;
		}(r, s.origin)) return void console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
		const { id: l, type: f, path: p } = Object.assign({ path: [] }, s.data), m = (s.data.argumentList || []).map(b);
		let g;
		try {
			const n = p.slice(0, -1).reduce((e, t) => e[t], e), r = p.reduce((e, t) => e[t], e);
			switch (f) {
				case "GET":
					g = r;
					break;
				case "SET":
					n[p.slice(-1)[0]] = b(s.data.value), g = !0;
					break;
				case "APPLY":
					g = r.apply(n, m);
					break;
				case "CONSTRUCT":
					g = function(e) {
						return Object.assign(e, { [t]: !0 });
					}(new r(...m));
					break;
				case "ENDPOINT":
					{
						const { port1: t, port2: n } = new MessageChannel();
						c(e, n), g = function(e, t) {
							return y.set(e, t), e;
						}(t, [t]);
					}
					break;
				case "RELEASE":
					g = void 0;
					break;
				default: return;
			}
		} catch (e) {
			g = {
				value: e,
				[i]: 0
			};
		}
		Promise.resolve(g).catch((e) => ({
			value: e,
			[i]: 0
		})).then((t) => {
			const [r, i] = d(t);
			n.postMessage(Object.assign(Object.assign({}, r), { id: l }), i), "RELEASE" === f && (n.removeEventListener("message", o), u(n), a in e && "function" == typeof e[a] && e[a]());
		}).catch((e) => {
			const [t, r] = d({
				value: /* @__PURE__ */ new TypeError("Unserializable return value"),
				[i]: 0
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
const p = /* @__PURE__ */ new WeakMap(), m = "FinalizationRegistry" in globalThis && new FinalizationRegistry((e) => {
	const t = (p.get(e) || 0) - 1;
	p.set(e, t), 0 === t && f(e);
});
function g(e, t, a = [], i = function() {}) {
	let o = !1;
	const s = new Proxy(i, {
		get(n, i) {
			if (l(o), i === r) return () => {
				(function(e) {
					m && m.unregister(e);
				})(s), f(e), t.clear(), o = !0;
			};
			if ("then" === i) {
				if (0 === a.length) return { then: () => s };
				const n = E(e, t, {
					type: "GET",
					path: a.map((e) => e.toString())
				}).then(b);
				return n.then.bind(n);
			}
			return g(e, t, [...a, i]);
		},
		set(n, r, i) {
			l(o);
			const [s, c] = d(i);
			return E(e, t, {
				type: "SET",
				path: [...a, r].map((e) => e.toString()),
				value: s
			}, c).then(b);
		},
		apply(r, i, s) {
			l(o);
			const c = a[a.length - 1];
			if (c === n) return E(e, t, { type: "ENDPOINT" }).then(b);
			if ("bind" === c) return g(e, t, a.slice(0, -1));
			const [u, f] = h(s);
			return E(e, t, {
				type: "APPLY",
				path: a.map((e) => e.toString()),
				argumentList: u
			}, f).then(b);
		},
		construct(n, r) {
			l(o);
			const [i, s] = h(r);
			return E(e, t, {
				type: "CONSTRUCT",
				path: a.map((e) => e.toString()),
				argumentList: i
			}, s).then(b);
		}
	});
	return function(e, t) {
		const n = (p.get(t) || 0) + 1;
		p.set(t, n), m && m.register(e, t, e);
	}(s, e), s;
}
function h(e) {
	const t = e.map(d);
	return [t.map((e) => e[0]), (n = t.map((e) => e[1]), Array.prototype.concat.apply([], n))];
	var n;
}
const y = /* @__PURE__ */ new WeakMap();
function d(e) {
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
		const i = new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
		t.set(i, a), e.start && e.start(), e.postMessage(Object.assign({ id: i }, n), r);
	});
}
function w(e, t, n = 0) {
	const r = 6378137, a = 6356752.314245179, i = r * r, o = a * a;
	e *= Math.PI / 180, t *= Math.PI / 180;
	const s = Math.cos(t), c = s * Math.cos(e), u = s * Math.sin(e), l = Math.sin(t);
	let f = i * c, p = i * u, m = o * l;
	const g = Math.sqrt(c * f + u * p + l * m);
	return f /= g, p /= g, m /= g, {
		x: f + c * n,
		y: p + u * n,
		z: m + l * n
	};
}
function v(e) {
	return "string" == typeof e ? e.split(",") : void 0 === e ? [] : [e];
}
function M(e) {
	return {
		near: Number.isFinite(e.near) ? Math.max(0, e.near) : 0,
		far: "number" != typeof e.far || Number.isNaN(e.far) ? 1 / 0 : e.far
	};
}
async function S(e) {
	const t = await fetch(e);
	if (!t.ok) throw new Error(`Failed to load labels: HTTP ${t.status}`);
	return t.json();
}
async function N(e, t, n) {
	const r = await S(e), a = [];
	if (!Array.isArray(r?.features)) throw new Error("GeoJSON features must be an array.");
	for (const i of r.features) {
		const e = i?.geometry?.coordinates, r = i?.properties?.[t];
		"Point" !== i?.geometry?.type || !Array.isArray(e) || !Number.isFinite(e[0]) || !Number.isFinite(e[1]) || Math.abs(e[0]) > 180 || Math.abs(e[1]) > 90 || "string" != typeof r && "number" != typeof r || "number" == typeof r && !Number.isFinite(r) || !String(r).trim() || a.push({
			position: w(e[0], e[1]),
			fieldText: String(r),
			filterText: i.properties[n]
		});
	}
	return a;
}
async function A(e, t) {
	return function(e, t) {
		if (!Array.isArray(e?.features)) throw new Error("GeoJSON features must be an array.");
		const n = [t, ...(t.children ?? []).map((e) => ({
			...t,
			...e
		}))], r = new Set(v(t.excludeValue)), a = /* @__PURE__ */ new Map();
		(t.children ?? []).forEach((e, t) => {
			for (const n of v(e.includeValue)) a.has(n) || a.set(n, t + 1);
		});
		const i = n.map(M), o = [], s = t.labelField ?? "name", c = t.filterField ?? s;
		let u = 1 / 0, l = 0;
		for (const f of e.features) {
			if (!f?.properties || "Point" !== f.geometry?.type) continue;
			const e = f.geometry.coordinates;
			if (!Array.isArray(e) || !Number.isFinite(e[0]) || !Number.isFinite(e[1]) || Math.abs(e[0]) > 180 || Math.abs(e[1]) > 90) continue;
			const t = f.properties[s];
			if ("string" != typeof t && "number" != typeof t || "number" == typeof t && !Number.isFinite(t)) continue;
			const p = String(t);
			if (!p.trim()) continue;
			const m = f.properties[c], g = r.has(m) ? a.get(m) : 0;
			if (void 0 === g) continue;
			const h = n[g], y = i[g];
			if (y.far < y.near) continue;
			const d = 1.2 * (h.fontSize ?? 10);
			o.push({
				id: o.length,
				name: p,
				longitude: e[0],
				latitude: e[1],
				position: w(e[0], e[1]),
				minHeight: y.near,
				maxHeight: y.far,
				textWidth: d * p.length,
				textHeight: d,
				styleId: g
			}), u = Math.min(u, y.near), l = Math.max(l, y.far);
		}
		return {
			points: o,
			styles: n,
			minHeight: o.length ? u : 0,
			maxHeight: l
		};
	}(await S(e), t);
}
c(((t, n) => {
	let r = {};
	for (var a in t) e(r, a, {
		get: t[a],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
})({
	loadLabelPoints: () => N,
	loadStyledLabelPoints: () => A
}));
