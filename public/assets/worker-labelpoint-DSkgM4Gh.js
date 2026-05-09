var t = Object.defineProperty;
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/ const e = Symbol("Comlink.proxy"), n = Symbol("Comlink.endpoint"), r = Symbol("Comlink.releaseProxy"), i = Symbol("Comlink.finalizer"), o = Symbol("Comlink.thrown"), s = (t) => "object" == typeof t && null !== t || "function" == typeof t, a = new Map([["proxy", {
	canHandle: (t) => s(t) && t[e],
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
		}), d(t, e, [], void 0);
	}(t))
}], ["throw", {
	canHandle: (t) => s(t) && o in t,
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
	n.addEventListener("message", function s(a) {
		if (!a || !a.data) return;
		if (!function(t, e) {
			for (const n of t) {
				if (e === n || "*" === n) return !0;
				if (n instanceof RegExp && n.test(e)) return !0;
			}
			return !1;
		}(r, a.origin)) return void console.warn(`Invalid origin '${a.origin}' for comlink proxy`);
		const { id: u, type: h, path: f } = Object.assign({ path: [] }, a.data), p = (a.data.argumentList || []).map(w);
		let d;
		try {
			const n = f.slice(0, -1).reduce((t, e) => t[e], t), r = f.reduce((t, e) => t[e], t);
			switch (h) {
				case "GET":
					d = r;
					break;
				case "SET":
					n[f.slice(-1)[0]] = w(a.data.value), d = !0;
					break;
				case "APPLY":
					d = r.apply(n, p);
					break;
				case "CONSTRUCT":
					d = function(t) {
						return Object.assign(t, { [e]: !0 });
					}(new r(...p));
					break;
				case "ENDPOINT":
					{
						const { port1: e, port2: n } = new MessageChannel();
						c(t, n), d = function(t, e) {
							return g.set(t, e), t;
						}(e, [e]);
					}
					break;
				case "RELEASE":
					d = void 0;
					break;
				default: return;
			}
		} catch (t) {
			d = {
				value: t,
				[o]: 0
			};
		}
		Promise.resolve(d).catch((t) => ({
			value: t,
			[o]: 0
		})).then((e) => {
			const [r, o] = m(e);
			n.postMessage(Object.assign(Object.assign({}, r), { id: u }), o), "RELEASE" === h && (n.removeEventListener("message", s), l(n), i in t && "function" == typeof t[i] && t[i]());
		}).catch((t) => {
			const [e, r] = m({
				value: /* @__PURE__ */ new TypeError("Unserializable return value"),
				[o]: 0
			});
			n.postMessage(Object.assign(Object.assign({}, e), { id: u }), r);
		});
	}), n.start && n.start();
}
function l(t) {
	(function(t) {
		return "MessagePort" === t.constructor.name;
	})(t) && t.close();
}
function u(t) {
	if (t) throw new Error("Proxy has been released and is not useable");
}
function h(t) {
	return b(t, /* @__PURE__ */ new Map(), { type: "RELEASE" }).then(() => {
		l(t);
	});
}
const f = /* @__PURE__ */ new WeakMap(), p = "FinalizationRegistry" in globalThis && new FinalizationRegistry((t) => {
	const e = (f.get(t) || 0) - 1;
	f.set(t, e), 0 === e && h(t);
});
function d(t, e, i = [], o = function() {}) {
	let s = !1;
	const a = new Proxy(o, {
		get(n, o) {
			if (u(s), o === r) return () => {
				(function(t) {
					p && p.unregister(t);
				})(a), h(t), e.clear(), s = !0;
			};
			if ("then" === o) {
				if (0 === i.length) return { then: () => a };
				const n = b(t, e, {
					type: "GET",
					path: i.map((t) => t.toString())
				}).then(w);
				return n.then.bind(n);
			}
			return d(t, e, [...i, o]);
		},
		set(n, r, o) {
			u(s);
			const [a, c] = m(o);
			return b(t, e, {
				type: "SET",
				path: [...i, r].map((t) => t.toString()),
				value: a
			}, c).then(w);
		},
		apply(r, o, a) {
			u(s);
			const c = i[i.length - 1];
			if (c === n) return b(t, e, { type: "ENDPOINT" }).then(w);
			if ("bind" === c) return d(t, e, i.slice(0, -1));
			const [l, h] = y(a);
			return b(t, e, {
				type: "APPLY",
				path: i.map((t) => t.toString()),
				argumentList: l
			}, h).then(w);
		},
		construct(n, r) {
			u(s);
			const [o, a] = y(r);
			return b(t, e, {
				type: "CONSTRUCT",
				path: i.map((t) => t.toString()),
				argumentList: o
			}, a).then(w);
		}
	});
	return function(t, e) {
		const n = (f.get(e) || 0) + 1;
		f.set(e, n), p && p.register(t, e, t);
	}(a, t), a;
}
function y(t) {
	const e = t.map(m);
	return [e.map((t) => t[0]), (n = e.map((t) => t[1]), Array.prototype.concat.apply([], n))];
	var n;
}
const g = /* @__PURE__ */ new WeakMap();
function m(t) {
	for (const [e, n] of a) if (n.canHandle(t)) {
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
		case "HANDLER": return a.get(t.name).deserialize(t.value);
		case "RAW": return t.value;
	}
}
function b(t, e, n, r) {
	return new Promise((i) => {
		const o = new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
		e.set(o, i), t.start && t.start(), t.postMessage(Object.assign({ id: o }, n), r);
	});
}
const E = [
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
var A = class t {
	static from(e) {
		if (!(e instanceof ArrayBuffer)) throw new Error("Data must be an instance of ArrayBuffer.");
		const [n, r] = new Uint8Array(e, 0, 2);
		if (219 !== n) throw new Error("Data does not appear to be in a KDBush format.");
		const i = r >> 4;
		if (1 !== i) throw new Error(`Got v${i} data when expected v1.`);
		const o = E[15 & r];
		if (!o) throw new Error("Unrecognized array type.");
		const [s] = new Uint16Array(e, 2, 1), [a] = new Uint32Array(e, 4, 1);
		return new t(a, s, o, e);
	}
	constructor(t, e = 64, n = Float64Array, r) {
		if (isNaN(t) || t < 0) throw new Error(`Unpexpected numItems value: ${t}.`);
		this.numItems = +t, this.nodeSize = Math.min(Math.max(+e, 2), 65535), this.ArrayType = n, this.IndexArrayType = t < 65536 ? Uint16Array : Uint32Array;
		const i = E.indexOf(this.ArrayType), o = 2 * t * this.ArrayType.BYTES_PER_ELEMENT, s = t * this.IndexArrayType.BYTES_PER_ELEMENT, a = (8 - s % 8) % 8;
		if (i < 0) throw new Error(`Unexpected typed array class: ${n}.`);
		r && r instanceof ArrayBuffer ? (this.data = r, this.ids = new this.IndexArrayType(this.data, 8, t), this.coords = new this.ArrayType(this.data, 8 + s + a, 2 * t), this._pos = 2 * t, this._finished = !0) : (this.data = new ArrayBuffer(8 + o + s + a), this.ids = new this.IndexArrayType(this.data, 8, t), this.coords = new this.ArrayType(this.data, 8 + s + a, 2 * t), this._pos = 0, this._finished = !1, new Uint8Array(this.data, 0, 2).set([219, 16 + i]), new Uint16Array(this.data, 2, 1)[0] = e, new Uint32Array(this.data, 4, 1)[0] = t);
	}
	add(t, e) {
		const n = this._pos >> 1;
		return this.ids[n] = n, this.coords[this._pos++] = t, this.coords[this._pos++] = e, n;
	}
	finish() {
		const t = this._pos >> 1;
		if (t !== this.numItems) throw new Error(`Added ${t} items when expected ${this.numItems}.`);
		return x(this.ids, this.coords, this.nodeSize, 0, this.numItems - 1, 0), this._finished = !0, this;
	}
	range(t, e, n, r) {
		if (!this._finished) throw new Error("Data not yet indexed - call index.finish().");
		const { ids: i, coords: o, nodeSize: s } = this, a = [
			0,
			i.length - 1,
			0
		], c = [];
		for (; a.length;) {
			const l = a.pop() || 0, u = a.pop() || 0, h = a.pop() || 0;
			if (u - h <= s) {
				for (let s = h; s <= u; s++) {
					const a = o[2 * s], l = o[2 * s + 1];
					a >= t && a <= n && l >= e && l <= r && c.push(i[s]);
				}
				continue;
			}
			const f = h + u >> 1, p = o[2 * f], d = o[2 * f + 1];
			p >= t && p <= n && d >= e && d <= r && c.push(i[f]), (0 === l ? t <= p : e <= d) && (a.push(h), a.push(f - 1), a.push(1 - l)), (0 === l ? n >= p : r >= d) && (a.push(f + 1), a.push(u), a.push(1 - l));
		}
		return c;
	}
	within(t, e, n) {
		if (!this._finished) throw new Error("Data not yet indexed - call index.finish().");
		const { ids: r, coords: i, nodeSize: o } = this, s = [
			0,
			r.length - 1,
			0
		], a = [], c = n * n;
		for (; s.length;) {
			const l = s.pop() || 0, u = s.pop() || 0, h = s.pop() || 0;
			if (u - h <= o) {
				for (let n = h; n <= u; n++) L(i[2 * n], i[2 * n + 1], t, e) <= c && a.push(r[n]);
				continue;
			}
			const f = h + u >> 1, p = i[2 * f], d = i[2 * f + 1];
			L(p, d, t, e) <= c && a.push(r[f]), (0 === l ? t - n <= p : e - n <= d) && (s.push(h), s.push(f - 1), s.push(1 - l)), (0 === l ? t + n >= p : e + n >= d) && (s.push(f + 1), s.push(u), s.push(1 - l));
		}
		return a;
	}
};
function x(t, e, n, r, i, o) {
	if (i - r <= n) return;
	const s = r + i >> 1;
	v(t, e, s, r, i, o), x(t, e, n, r, s - 1, 1 - o), x(t, e, n, s + 1, i, 1 - o);
}
function v(t, e, n, r, i, o) {
	for (; i > r;) {
		if (i - r > 600) {
			const s = i - r + 1, a = n - r + 1, c = Math.log(s), l = .5 * Math.exp(2 * c / 3), u = .5 * Math.sqrt(c * l * (s - l) / s) * (a - s / 2 < 0 ? -1 : 1);
			v(t, e, n, Math.max(r, Math.floor(n - a * l / s + u)), Math.min(i, Math.floor(n + (s - a) * l / s + u)), o);
		}
		const s = e[2 * n + o];
		let a = r, c = i;
		for (M(t, e, r, n), e[2 * i + o] > s && M(t, e, r, i); a < c;) {
			for (M(t, e, a, c), a++, c--; e[2 * a + o] < s;) a++;
			for (; e[2 * c + o] > s;) c--;
		}
		e[2 * r + o] === s ? M(t, e, r, c) : (c++, M(t, e, c, i)), c <= n && (r = c + 1), n <= c && (i = c - 1);
	}
}
function M(t, e, n, r) {
	S(t, n, r), S(e, 2 * n, 2 * r), S(e, 2 * n + 1, 2 * r + 1);
}
function S(t, e, n) {
	const r = t[e];
	t[e] = t[n], t[n] = r;
}
function L(t, e, n, r) {
	const i = t - n, o = e - r;
	return i * i + o * o;
}
function O(t, e) {
	return toString.call(t) === `[object ${e}]`;
}
function T(t) {
	return O(t, "Number");
}
function I(t = {}, e = {}) {
	let n;
	for (n in e) t[n] = e[n];
	return t;
}
function P(t, e, n = 0) {
	const r = 6378137, i = 6356752.314245179, o = r * r, s = i * i;
	t *= Math.PI / 180, e *= Math.PI / 180;
	const a = Math.cos(e), c = a * Math.cos(t), l = a * Math.sin(t), u = Math.sin(e);
	let h = o * c, f = o * l, p = s * u;
	const d = Math.sqrt(c * h + l * f + u * p);
	return h /= d, f /= d, p /= d, {
		x: h + c * n,
		y: f + l * n,
		z: p + u * n
	};
}
function z(t) {
	return 180 * t / Math.PI;
}
var R = ((e, n) => {
	let r = {};
	for (var i in e) t(r, i, {
		get: e[i],
		enumerable: !0
	});
	return n || t(r, Symbol.toStringTag, { value: "Module" }), r;
})({
	cancelPromise: () => D,
	checkRectangleNoIntersect: () => H,
	clear: () => V,
	deleteLabelRectangle: () => Z,
	filterByBounds: () => F,
	getFilterPointsList: () => j,
	getLabelEntities: () => B,
	getLabelPointList: () => $,
	isOverlapping: () => G,
	isPointOnFrontOfGlobe: () => C,
	loadLabelPoints: () => _
});
let k = /* @__PURE__ */ new Map(), N = /* @__PURE__ */ new Map();
function U(t, e) {
	if (e && e.length > 0) {
		let n, r;
		const i = e.length;
		for (let o = 0; o < i; o++) {
			const i = e[o];
			if (i && i.includeValue === t) {
				r = i.fontSize, n = n ? I(n, i) : i;
				break;
			}
		}
		return {
			childOptions: n,
			childFontSize: r
		};
	}
}
async function _(t, e, n) {
	if (!t || k.has(t)) return;
	let r = await (await fetch(e)).json();
	if (!r) return;
	const i = r.features;
	let o = n.minLevel ?? 1, s = n.maxLevel ?? 18;
	const a = n.labelField, c = n.filterField ?? a;
	let l = [];
	O(n.excludeValue, "String") && (l = n.excludeValue.split(","));
	const u = l, h = 1.2 * (n.fontSize ?? 12), f = n.children;
	if (i) {
		const e = i.length, l = new A(e), p = new Array();
		for (let t = 0; t < e; t++) {
			const e = i[t], n = e.properties;
			if (n) {
				const r = n[a], i = n[c], d = n.minl, y = n.maxl, g = e.geometry.coordinates;
				let m, w = h;
				if (u && u.indexOf(i) >= 0) {
					const t = U(r, f);
					t && (t.childFontSize && (w = 1.2 * t.childFontSize), t.childOptions && (m = t.childOptions));
				}
				const b = {
					id: t,
					name: r,
					minZoom: d,
					maxZoom: y,
					position: P(g[0], g[1]),
					textWidth: w * r.length,
					textHeight: w,
					childOptions: m
				};
				l.add(g[0], g[1]), p.push(b), T(d) && d < o && (o = d), T(y) && y > s && (s = y);
			}
		}
		return l.finish(), k.set(t, {
			indexKDB: l,
			ptList: p,
			baseLabelOptions: n,
			exclude: u,
			idRectMap: /* @__PURE__ */ new Map()
		}), i.length = 0, r = void 0, {
			min: o,
			max: s
		};
	}
}
function D(t) {
	N.set(t, !0);
}
function F(t, e, n) {
	if (!e || !k.has(t)) return;
	const r = k.get(t);
	if (!r) return;
	N.set(t, !1);
	const i = z(e.west), o = z(e.east), s = z(e.north), a = z(e.south), c = r.indexKDB.range(i, a, o, s);
	if (N.get(t)) throw c.length = 0, /* @__PURE__ */ new Error("0");
	if (null != n) {
		const e = c.length, i = [];
		for (let o = 0; o < e; o++) {
			if (N.get(t)) throw i.length = 0, c.length = 0, /* @__PURE__ */ new Error("0");
			const e = c[o], s = r.ptList[e];
			null != s.minZoom && s.maxZoom ? n >= s.minZoom && n <= s.maxZoom && i.push(e) : i.push(e);
		}
		return c.length = 0, i;
	}
	return c;
}
function j(t, e) {
	if (!k.has(t)) return;
	const n = k.get(t);
	if (!n) return;
	const r = [], i = e.length;
	for (let o = 0; o < i; o++) {
		const t = e[o], i = n.ptList[t];
		r.push(i);
	}
	return r;
}
function B(t, e) {
	if (!k.has(t)) return;
	const n = k.get(t);
	if (!n) return;
	const r = n.baseLabelOptions, i = [], o = e.length;
	for (let s = 0; s < o; s++) {
		const t = e[s], o = n.ptList[t];
		let a = r;
		o.childOptions && (a = I({ ...r }, o.childOptions));
		const c = o.position, l = {
			labelOption: void 0,
			billboardOption: void 0,
			lastIVtAnnoStyle: a
		};
		a.imgUrl && (l.billboardOption = {
			id: t,
			show: !0,
			position: c,
			disableDepthTestDistance: Number.POSITIVE_INFINITY
		}), l.labelOption = {
			position: c,
			text: o.name,
			id: t
		}, i.push(l);
	}
	return i;
}
function C(t, e) {
	return !(function(t, e) {
		const n = t.x - e.x, r = t.y - e.y, i = t.z - e.z;
		return Math.sqrt(n * n + r * r + i * i);
	}(t, e) > 6371e3);
}
function $(t, e) {
	if (!k.has(t)) return;
	const n = k.get(t);
	return n ? e.map((t) => n.ptList[t]) : void 0;
}
function H(t, e, n) {
	const r = k.get(t);
	if (!r) return !1;
	const i = r.idRectMap;
	let o = !1;
	for (let [s, a] of i) if (a && (o = G(a, e), o)) break;
	return o || i.set(n, e), o;
}
function Z(t, e) {
	const n = k.get(t);
	if (!n) return !1;
	const r = n.idRectMap;
	return !!r && r.delete(e);
}
function G(t, e) {
	return !(t.x > e.x + e.width || e.x > t.x + t.width || t.y > e.y + e.height || e.y > t.y + t.height);
}
function V(t) {
	if (k.has(t)) {
		const e = k.get(t);
		e && (e.ptList.length = 0, e.indexKDB.data = null, e.idRectMap.clear(), e.baseLabelOptions = void 0, k.delete(t));
	}
}
c(R);
