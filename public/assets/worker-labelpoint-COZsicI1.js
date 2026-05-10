var t = Object.defineProperty;
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/ const e = Symbol("Comlink.proxy"), n = Symbol("Comlink.endpoint"), r = Symbol("Comlink.releaseProxy"), i = Symbol("Comlink.finalizer"), s = Symbol("Comlink.thrown"), a = (t) => "object" == typeof t && null !== t || "function" == typeof t, o = new Map([["proxy", {
	canHandle: (t) => a(t) && t[e],
	serialize(t) {
		const { port1: e, port2: n } = new MessageChannel();
		return c(t, e), [n, [n]];
	},
	deserialize: (t) => (t.start(), function(t) {
		const e = /* @__PURE__ */ new Map();
		return t.addEventListener("message", function(t) {
			const { data: n } = t;
			if (!n || !n.id) return;
			const r = e.get(n.id);
			if (r) try {
				r(n);
			} finally {
				e.delete(n.id);
			}
		}), p(t, e, [], void 0);
	}(t))
}], ["throw", {
	canHandle: (t) => a(t) && s in t,
	serialize({ value: t }) {
		let e;
		return e = t instanceof Error ? {
			isError: !0,
			value: {
				message: t.message,
				name: t.name,
				stack: t.stack
			}
		} : {
			isError: !1,
			value: t
		}, [e, []];
	},
	deserialize(t) {
		if (t.isError) throw Object.assign(new Error(t.value.message), t.value);
		throw t.value;
	}
}]]);
function c(t, n = globalThis, r = ["*"]) {
	n.addEventListener("message", function a(o) {
		if (!o || !o.data) return;
		if (!function(t, e) {
			for (const n of t) {
				if (e === n || "*" === n) return !0;
				if (n instanceof RegExp && n.test(e)) return !0;
			}
			return !1;
		}(r, o.origin)) return void console.warn(`Invalid origin '${o.origin}' for comlink proxy`);
		const { id: h, type: l, path: f } = Object.assign({ path: [] }, o.data), d = (o.data.argumentList || []).map(w);
		let p;
		try {
			const n = f.slice(0, -1).reduce((t, e) => t[e], t), r = f.reduce((t, e) => t[e], t);
			switch (l) {
				case "GET":
					p = r;
					break;
				case "SET":
					n[f.slice(-1)[0]] = w(o.data.value), p = !0;
					break;
				case "APPLY":
					p = r.apply(n, d);
					break;
				case "CONSTRUCT":
					p = function(t) {
						return Object.assign(t, { [e]: !0 });
					}(new r(...d));
					break;
				case "ENDPOINT":
					{
						const { port1: e, port2: n } = new MessageChannel();
						c(t, n), p = function(t, e) {
							return g.set(t, e), t;
						}(e, [e]);
					}
					break;
				case "RELEASE":
					p = void 0;
					break;
				default: return;
			}
		} catch (t) {
			p = {
				value: t,
				[s]: 0
			};
		}
		Promise.resolve(p).catch((t) => ({
			value: t,
			[s]: 0
		})).then((e) => {
			const [r, s] = m(e);
			n.postMessage(Object.assign(Object.assign({}, r), { id: h }), s), "RELEASE" === l && (n.removeEventListener("message", a), u(n), i in t && "function" == typeof t[i] && t[i]());
		}).catch((t) => {
			const [e, r] = m({
				value: /* @__PURE__ */ new TypeError("Unserializable return value"),
				[s]: 0
			});
			n.postMessage(Object.assign(Object.assign({}, e), { id: h }), r);
		});
	}), n.start && n.start();
}
function u(t) {
	(function(t) {
		return "MessagePort" === t.constructor.name;
	})(t) && t.close();
}
function h(t) {
	if (t) throw new Error("Proxy has been released and is not useable");
}
function l(t) {
	return E(t, /* @__PURE__ */ new Map(), { type: "RELEASE" }).then(() => {
		u(t);
	});
}
const f = /* @__PURE__ */ new WeakMap(), d = "FinalizationRegistry" in globalThis && new FinalizationRegistry((t) => {
	const e = (f.get(t) || 0) - 1;
	f.set(t, e), 0 === e && l(t);
});
function p(t, e, i = [], s = function() {}) {
	let a = !1;
	const o = new Proxy(s, {
		get(n, s) {
			if (h(a), s === r) return () => {
				(function(t) {
					d && d.unregister(t);
				})(o), l(t), e.clear(), a = !0;
			};
			if ("then" === s) {
				if (0 === i.length) return { then: () => o };
				const n = E(t, e, {
					type: "GET",
					path: i.map((t) => t.toString())
				}).then(w);
				return n.then.bind(n);
			}
			return p(t, e, [...i, s]);
		},
		set(n, r, s) {
			h(a);
			const [o, c] = m(s);
			return E(t, e, {
				type: "SET",
				path: [...i, r].map((t) => t.toString()),
				value: o
			}, c).then(w);
		},
		apply(r, s, o) {
			h(a);
			const c = i[i.length - 1];
			if (c === n) return E(t, e, { type: "ENDPOINT" }).then(w);
			if ("bind" === c) return p(t, e, i.slice(0, -1));
			const [u, l] = y(o);
			return E(t, e, {
				type: "APPLY",
				path: i.map((t) => t.toString()),
				argumentList: u
			}, l).then(w);
		},
		construct(n, r) {
			h(a);
			const [s, o] = y(r);
			return E(t, e, {
				type: "CONSTRUCT",
				path: i.map((t) => t.toString()),
				argumentList: s
			}, o).then(w);
		}
	});
	return function(t, e) {
		const n = (f.get(e) || 0) + 1;
		f.set(e, n), d && d.register(t, e, t);
	}(o, t), o;
}
function y(t) {
	const e = t.map(m);
	return [e.map((t) => t[0]), (n = e.map((t) => t[1]), Array.prototype.concat.apply([], n))];
	var n;
}
const g = /* @__PURE__ */ new WeakMap();
function m(t) {
	for (const [e, n] of o) if (n.canHandle(t)) {
		const [r, i] = n.serialize(t);
		return [{
			type: "HANDLER",
			name: e,
			value: r
		}, i];
	}
	return [{
		type: "RAW",
		value: t
	}, g.get(t) || []];
}
function w(t) {
	switch (t.type) {
		case "HANDLER": return o.get(t.name).deserialize(t.value);
		case "RAW": return t.value;
	}
}
function E(t, e, n, r) {
	return new Promise((i) => {
		const s = new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
		e.set(s, i), t.start && t.start(), t.postMessage(Object.assign({ id: s }, n), r);
	});
}
const b = [
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array
];
var x = class t {
	static from(e) {
		if (!(e instanceof ArrayBuffer)) throw new Error("Data must be an instance of ArrayBuffer.");
		const [n, r] = new Uint8Array(e, 0, 2);
		if (219 !== n) throw new Error("Data does not appear to be in a KDBush format.");
		const i = r >> 4;
		if (1 !== i) throw new Error(`Got v${i} data when expected v1.`);
		const s = b[15 & r];
		if (!s) throw new Error("Unrecognized array type.");
		const [a] = new Uint16Array(e, 2, 1), [o] = new Uint32Array(e, 4, 1);
		return new t(o, a, s, e);
	}
	constructor(t, e = 64, n = Float64Array, r) {
		if (isNaN(t) || t < 0) throw new Error(`Unpexpected numItems value: ${t}.`);
		this.numItems = +t, this.nodeSize = Math.min(Math.max(+e, 2), 65535), this.ArrayType = n, this.IndexArrayType = t < 65536 ? Uint16Array : Uint32Array;
		const i = b.indexOf(this.ArrayType), s = 2 * t * this.ArrayType.BYTES_PER_ELEMENT, a = t * this.IndexArrayType.BYTES_PER_ELEMENT, o = (8 - a % 8) % 8;
		if (i < 0) throw new Error(`Unexpected typed array class: ${n}.`);
		r && r instanceof ArrayBuffer ? (this.data = r, this.ids = new this.IndexArrayType(this.data, 8, t), this.coords = new this.ArrayType(this.data, 8 + a + o, 2 * t), this._pos = 2 * t, this._finished = !0) : (this.data = new ArrayBuffer(8 + s + a + o), this.ids = new this.IndexArrayType(this.data, 8, t), this.coords = new this.ArrayType(this.data, 8 + a + o, 2 * t), this._pos = 0, this._finished = !1, new Uint8Array(this.data, 0, 2).set([219, 16 + i]), new Uint16Array(this.data, 2, 1)[0] = e, new Uint32Array(this.data, 4, 1)[0] = t);
	}
	add(t, e) {
		const n = this._pos >> 1;
		return this.ids[n] = n, this.coords[this._pos++] = t, this.coords[this._pos++] = e, n;
	}
	finish() {
		const t = this._pos >> 1;
		if (t !== this.numItems) throw new Error(`Added ${t} items when expected ${this.numItems}.`);
		return A(this.ids, this.coords, this.nodeSize, 0, this.numItems - 1, 0), this._finished = !0, this;
	}
	range(t, e, n, r) {
		if (!this._finished) throw new Error("Data not yet indexed - call index.finish().");
		const { ids: i, coords: s, nodeSize: a } = this, o = [
			0,
			i.length - 1,
			0
		], c = [];
		for (; o.length;) {
			const u = o.pop() || 0, h = o.pop() || 0, l = o.pop() || 0;
			if (h - l <= a) {
				for (let a = l; a <= h; a++) {
					const o = s[2 * a], u = s[2 * a + 1];
					o >= t && o <= n && u >= e && u <= r && c.push(i[a]);
				}
				continue;
			}
			const f = l + h >> 1, d = s[2 * f], p = s[2 * f + 1];
			d >= t && d <= n && p >= e && p <= r && c.push(i[f]), (0 === u ? t <= d : e <= p) && (o.push(l), o.push(f - 1), o.push(1 - u)), (0 === u ? n >= d : r >= p) && (o.push(f + 1), o.push(h), o.push(1 - u));
		}
		return c;
	}
	within(t, e, n) {
		if (!this._finished) throw new Error("Data not yet indexed - call index.finish().");
		const { ids: r, coords: i, nodeSize: s } = this, a = [
			0,
			r.length - 1,
			0
		], o = [], c = n * n;
		for (; a.length;) {
			const u = a.pop() || 0, h = a.pop() || 0, l = a.pop() || 0;
			if (h - l <= s) {
				for (let n = l; n <= h; n++) T(i[2 * n], i[2 * n + 1], t, e) <= c && o.push(r[n]);
				continue;
			}
			const f = l + h >> 1, d = i[2 * f], p = i[2 * f + 1];
			T(d, p, t, e) <= c && o.push(r[f]), (0 === u ? t - n <= d : e - n <= p) && (a.push(l), a.push(f - 1), a.push(1 - u)), (0 === u ? t + n >= d : e + n >= p) && (a.push(f + 1), a.push(h), a.push(1 - u));
		}
		return o;
	}
};
function A(t, e, n, r, i, s) {
	if (i - r <= n) return;
	const a = r + i >> 1;
	M(t, e, a, r, i, s), A(t, e, n, r, a - 1, 1 - s), A(t, e, n, a + 1, i, 1 - s);
}
function M(t, e, n, r, i, s) {
	for (; i > r;) {
		if (i - r > 600) {
			const a = i - r + 1, o = n - r + 1, c = Math.log(a), u = .5 * Math.exp(2 * c / 3), h = .5 * Math.sqrt(c * u * (a - u) / a) * (o - a / 2 < 0 ? -1 : 1);
			M(t, e, n, Math.max(r, Math.floor(n - o * u / a + h)), Math.min(i, Math.floor(n + (a - o) * u / a + h)), s);
		}
		const a = e[2 * n + s];
		let o = r, c = i;
		for (v(t, e, r, n), e[2 * i + s] > a && v(t, e, r, i); o < c;) {
			for (v(t, e, o, c), o++, c--; e[2 * o + s] < a;) o++;
			for (; e[2 * c + s] > a;) c--;
		}
		e[2 * r + s] === a ? v(t, e, r, c) : (c++, v(t, e, c, i)), c <= n && (r = c + 1), n <= c && (i = c - 1);
	}
}
function v(t, e, n, r) {
	S(t, n, r), S(e, 2 * n, 2 * r), S(e, 2 * n + 1, 2 * r + 1);
}
function S(t, e, n) {
	const r = t[e];
	t[e] = t[n], t[n] = r;
}
function T(t, e, n, r) {
	const i = t - n, s = e - r;
	return i * i + s * s;
}
function L(t, e) {
	return toString.call(t) === `[object ${e}]`;
}
function P(t) {
	return L(t, "Number");
}
function I(t, e, n = 0) {
	const r = 6378137, i = 6356752.314245179, s = r * r, a = i * i;
	t *= Math.PI / 180, e *= Math.PI / 180;
	const o = Math.cos(e), c = o * Math.cos(t), u = o * Math.sin(t), h = Math.sin(e);
	let l = s * c, f = s * u, d = a * h;
	const p = Math.sqrt(c * l + u * f + h * d);
	return l /= p, f /= p, d /= p, {
		x: l + c * n,
		y: f + u * n,
		z: d + h * n
	};
}
function R(t) {
	return 180 * t / Math.PI;
}
var k = ((e, n) => {
	let r = {};
	for (var i in e) t(r, i, {
		get: e[i],
		enumerable: !0
	});
	return n || t(r, Symbol.toStringTag, { value: "Module" }), r;
})({
	cancelPromise: () => C,
	checkRectangleNoIntersect: () => V,
	clear: () => W,
	deleteLabelRectangle: () => $,
	filterByBounds: () => H,
	getFilterPointsList: () => j,
	getLabelEntities: () => B,
	getLabelPointList: () => F,
	isOverlapping: () => G,
	isPointOnFrontOfGlobe: () => D,
	loadLabelPoints: () => N
});
let z = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map();
function U(t, e) {
	let n = !1;
	return L(e.excludeValue, "String") ? n = e.excludeValue.split(",").findIndex((e) => e === t) >= 0 : e.excludeValue && t === e.excludeValue && (n = !0), n;
}
function _(t, e) {
	let n, r = !1;
	if (e.children) {
		const i = e.children, s = i.length;
		for (let e = 0; e < s; e++) {
			const s = i[e];
			if (s.includeValue) if (P(s.includeValue)) {
				if (t === s.includeValue) {
					r = !0, n = s;
					break;
				}
			} else {
				const e = s.includeValue.split(",");
				if (e && (r = e.indexOf(t) >= 0, r)) {
					n = s;
					break;
				}
			}
		}
	}
	return n;
}
async function N(t, e, n) {
	if (!t || z.has(t)) return;
	let r = await (await fetch(e)).json();
	if (!r) return;
	const i = r.features;
	if (i) {
		let e = P(n.near) ? n.near : 100, s = P(n.far) ? n.far : n.near;
		const a = n.labelField, o = n.filterField ?? a, c = 1.2 * (n.fontSize ?? 12), u = i.length, h = new x(u), l = new Array();
		for (let t = 0; t < u; t++) {
			const r = i[t], u = r.properties;
			if (u) {
				const i = u[a], f = u[o], d = r.geometry.coordinates;
				let p, y, g, m = c, w = !1;
				if (n.excludeValue && (w = U(f, n)), w) {
					const t = _(f, n);
					t && (p = {
						...n,
						...t
					}, m = 1.2 * (p.fontSize ?? 12), P(p.near) && (y = p.near, e > p.near && (e = p.near)), P(p.far) && (g = p.far, s < p.far && (s = p.far)));
				} else p = void 0;
				const E = {
					id: t,
					name: i,
					minHeight: y,
					maxHeight: g,
					position: I(d[0], d[1]),
					textWidth: m * i.length,
					textHeight: m,
					itemStyleContent: p
				};
				h.add(d[0], d[1]), l.push(E);
			}
		}
		return h.finish(), z.set(t, {
			indexKDB: h,
			ptList: l,
			baseStyleContent: n,
			idRectMap: /* @__PURE__ */ new Map()
		}), i.length = 0, r = void 0, {
			minHeight: e,
			maxHeight: s
		};
	}
}
function C(t) {
	O.set(t, !0);
}
function H(t, e, n) {
	if (!e || !z.has(t)) return;
	const r = z.get(t);
	if (!r) return;
	O.set(t, !1);
	const i = R(e.west), s = R(e.east), a = R(e.north), o = R(e.south), c = r.indexKDB.range(i, o, s, a);
	if (O.get(t)) throw c.length = 0, /* @__PURE__ */ new Error("0");
	return c;
}
function j(t, e) {
	if (!z.has(t)) return;
	const n = z.get(t);
	if (!n) return;
	const r = [], i = e.length;
	for (let s = 0; s < i; s++) {
		const t = e[s], i = n.ptList[t];
		r.push(i);
	}
	return r;
}
function B(t, e, n) {
	if (!z.has(t)) return;
	const r = z.get(t);
	if (!r) return;
	const i = [], s = e.length;
	for (let a = 0; a < s; a++) {
		const t = e[a], s = r.ptList[t];
		null != s.maxHeight && null != s.minHeight && n >= s.minHeight && n <= s.maxHeight && i.push(s);
	}
	return i;
}
function D(t, e) {
	return !(function(t, e) {
		const n = t.x - e.x, r = t.y - e.y, i = t.z - e.z;
		return Math.sqrt(n * n + r * r + i * i);
	}(t, e) > 6371e3);
}
function F(t, e) {
	if (!z.has(t)) return;
	const n = z.get(t);
	return n ? e.map((t) => n.ptList[t]) : void 0;
}
function V(t, e, n) {
	const r = z.get(t);
	if (!r) return !1;
	const i = r.idRectMap;
	let s = !1;
	for (let [a, o] of i) if (o && (s = G(o, e), s)) break;
	return s || i.set(n, e), s;
}
function $(t, e) {
	const n = z.get(t);
	if (!n) return !1;
	const r = n.idRectMap;
	return !!r && r.delete(e);
}
function G(t, e) {
	return !(t.x > e.x + e.width || e.x > t.x + t.width || t.y > e.y + e.height || e.y > t.y + t.height);
}
function W(t) {
	if (z.has(t)) {
		const e = z.get(t);
		e && (e.ptList.length = 0, e.indexKDB.data = null, e.idRectMap.clear(), e.baseStyleContent = void 0, z.delete(t));
	}
}
c(k);
