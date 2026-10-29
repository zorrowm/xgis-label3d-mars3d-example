var t = Object.defineProperty;
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/ const e = Symbol("Comlink.proxy"), n = Symbol("Comlink.endpoint"), r = Symbol("Comlink.releaseProxy"), i = Symbol("Comlink.finalizer"), s = Symbol("Comlink.thrown"), o = (t) => "object" == typeof t && null !== t || "function" == typeof t, a = /* @__PURE__ */ new Map([["proxy", {
	canHandle: (t) => o(t) && t[e],
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
	canHandle: (t) => o(t) && s in t,
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
	n.addEventListener("message", function o(a) {
		if (!a || !a.data) return;
		if (!function(t, e) {
			for (const n of t) {
				if (e === n || "*" === n) return !0;
				if (n instanceof RegExp && n.test(e)) return !0;
			}
			return !1;
		}(r, a.origin)) return void console.warn(`Invalid origin '${a.origin}' for comlink proxy`);
		const { id: l, type: h, path: f } = Object.assign({ path: [] }, a.data), d = (a.data.argumentList || []).map(w);
		let p;
		try {
			const n = f.slice(0, -1).reduce((t, e) => t[e], t), r = f.reduce((t, e) => t[e], t);
			switch (h) {
				case "GET":
					p = r;
					break;
				case "SET":
					n[f.slice(-1)[0]] = w(a.data.value), p = !0;
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
			n.postMessage(Object.assign(Object.assign({}, r), { id: l }), s), "RELEASE" === h && (n.removeEventListener("message", o), u(n), i in t && "function" == typeof t[i] && t[i]());
		}).catch((t) => {
			const [e, r] = m({
				value: /* @__PURE__ */ new TypeError("Unserializable return value"),
				[s]: 0
			});
			n.postMessage(Object.assign(Object.assign({}, e), { id: l }), r);
		});
	}), n.start && n.start();
}
function u(t) {
	(function(t) {
		return "MessagePort" === t.constructor.name;
	})(t) && t.close();
}
function l(t) {
	if (t) throw new Error("Proxy has been released and is not useable");
}
function h(t) {
	return b(t, /* @__PURE__ */ new Map(), { type: "RELEASE" }).then(() => {
		u(t);
	});
}
const f = /* @__PURE__ */ new WeakMap(), d = "FinalizationRegistry" in globalThis && new FinalizationRegistry((t) => {
	const e = (f.get(t) || 0) - 1;
	f.set(t, e), 0 === e && h(t);
});
function p(t, e, i = [], s = function() {}) {
	let o = !1;
	const a = new Proxy(s, {
		get(n, s) {
			if (l(o), s === r) return () => {
				(function(t) {
					d && d.unregister(t);
				})(a), h(t), e.clear(), o = !0;
			};
			if ("then" === s) {
				if (0 === i.length) return { then: () => a };
				const n = b(t, e, {
					type: "GET",
					path: i.map((t) => t.toString())
				}).then(w);
				return n.then.bind(n);
			}
			return p(t, e, [...i, s]);
		},
		set(n, r, s) {
			l(o);
			const [a, c] = m(s);
			return b(t, e, {
				type: "SET",
				path: [...i, r].map((t) => t.toString()),
				value: a
			}, c).then(w);
		},
		apply(r, s, a) {
			l(o);
			const c = i[i.length - 1];
			if (c === n) return b(t, e, { type: "ENDPOINT" }).then(w);
			if ("bind" === c) return p(t, e, i.slice(0, -1));
			const [u, h] = y(a);
			return b(t, e, {
				type: "APPLY",
				path: i.map((t) => t.toString()),
				argumentList: u
			}, h).then(w);
		},
		construct(n, r) {
			l(o);
			const [s, a] = y(r);
			return b(t, e, {
				type: "CONSTRUCT",
				path: i.map((t) => t.toString()),
				argumentList: s
			}, a).then(w);
		}
	});
	return function(t, e) {
		const n = (f.get(e) || 0) + 1;
		f.set(e, n), d && d.register(t, e, t);
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
		const s = new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
		e.set(s, i), t.start && t.start(), t.postMessage(Object.assign({ id: s }, n), r);
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
], M = /* @__PURE__ */ new Uint32Array(96);
var A = class t {
	static from(e) {
		if (!e || void 0 === e.byteLength || e.buffer) throw new Error("Data must be an instance of ArrayBuffer or SharedArrayBuffer.");
		const [n, r] = new Uint8Array(e, 0, 2);
		if (219 !== n) throw new Error("Data does not appear to be in a KDBush format.");
		const i = r >> 4;
		if (1 !== i) throw new Error(`Got v${i} data when expected v1.`);
		const s = E[15 & r];
		if (!s) throw new Error("Unrecognized array type.");
		const [o] = new Uint16Array(e, 2, 1), [a] = new Uint32Array(e, 4, 1);
		return new t(a, o, s, void 0, e);
	}
	constructor(t, e = 64, n = Float64Array, r = ArrayBuffer, i) {
		if (isNaN(t) || t < 0) throw new Error(`Unexpected numItems value: ${t}.`);
		this.numItems = +t, this.nodeSize = Math.min(Math.max(+e, 2), 65535), this.ArrayType = n, this.IndexArrayType = t < 65536 ? Uint16Array : Uint32Array;
		const s = E.indexOf(this.ArrayType), o = 2 * t * this.ArrayType.BYTES_PER_ELEMENT, a = t * this.IndexArrayType.BYTES_PER_ELEMENT, c = (8 - a % 8) % 8;
		if (s < 0) throw new Error(`Unexpected typed array class: ${n}.`);
		if (i) this.data = i, this.ids = new this.IndexArrayType(i, 8, t), this.coords = new n(i, 8 + a + c, 2 * t), this._pos = 2 * t, this._finished = !0;
		else {
			const i = this.data = new r(8 + o + a + c);
			this.ids = new this.IndexArrayType(i, 8, t), this.coords = new n(i, 8 + a + c, 2 * t), this._pos = 0, this._finished = !1, new Uint8Array(i, 0, 2).set([219, 16 + s]), new Uint16Array(i, 2, 1)[0] = e, new Uint32Array(i, 4, 1)[0] = t;
		}
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
		const { ids: i, coords: s, nodeSize: o } = this;
		M[0] = 0, M[1] = i.length - 1, M[2] = 0;
		let a = 3;
		const c = [];
		for (; a > 0;) {
			const u = M[--a], l = M[--a], h = M[--a];
			if (l - h <= o) {
				for (let o = h; o <= l; o++) {
					const a = s[2 * o], u = s[2 * o + 1];
					a >= t && a <= n && u >= e && u <= r && c.push(i[o]);
				}
				continue;
			}
			const f = h + l >> 1, d = s[2 * f], p = s[2 * f + 1];
			d >= t && d <= n && p >= e && p <= r && c.push(i[f]), (0 === u ? t <= d : e <= p) && (M[a++] = h, M[a++] = f - 1, M[a++] = 1 - u), (0 === u ? n >= d : r >= p) && (M[a++] = f + 1, M[a++] = l, M[a++] = 1 - u);
		}
		return c;
	}
	within(t, e, n) {
		const r = [];
		return this.withinInto(t, e, n, r), r;
	}
	withinInto(t, e, n, r) {
		if (!this._finished) throw new Error("Data not yet indexed - call index.finish().");
		const { ids: i, coords: s, nodeSize: o } = this;
		M[0] = 0, M[1] = i.length - 1, M[2] = 0;
		let a = 3, c = 0;
		const u = n * n;
		for (; a > 0;) {
			const l = M[--a], h = M[--a], f = M[--a];
			if (h - f <= o) {
				for (let n = f; n <= h; n++) I(s[2 * n], s[2 * n + 1], t, e) <= u && (r[c++] = i[n]);
				continue;
			}
			const d = f + h >> 1, p = s[2 * d], y = s[2 * d + 1];
			I(p, y, t, e) <= u && (r[c++] = i[d]), (0 === l ? t - n <= p : e - n <= y) && (M[a++] = f, M[a++] = d - 1, M[a++] = 1 - l), (0 === l ? t + n >= p : e + n >= y) && (M[a++] = d + 1, M[a++] = h, M[a++] = 1 - l);
		}
		return c;
	}
};
function x(t, e, n, r, i, s) {
	if (i - r <= n) return;
	const o = r + i >> 1;
	v(t, e, o, r, i, s), x(t, e, n, r, o - 1, 1 - s), x(t, e, n, o + 1, i, 1 - s);
}
function v(t, e, n, r, i, s) {
	for (; i > r;) {
		if (i - r > 600) {
			const o = i - r + 1, a = n - r + 1, c = Math.log(o), u = .5 * Math.exp(2 * c / 3), l = .5 * Math.sqrt(c * u * (o - u) / o) * (a - o / 2 < 0 ? -1 : 1);
			v(t, e, n, Math.max(r, Math.floor(n - a * u / o + l)), Math.min(i, Math.floor(n + (o - a) * u / o + l)), s);
		}
		const o = e[2 * n + s];
		let a = r, c = i;
		for (S(t, e, r, n), e[2 * i + s] > o && S(t, e, r, i); a < c;) {
			for (S(t, e, a, c), a++, c--; e[2 * a + s] < o;) a++;
			for (; e[2 * c + s] > o;) c--;
		}
		e[2 * r + s] === o ? S(t, e, r, c) : (c++, S(t, e, c, i)), c <= n && (r = c + 1), n <= c && (i = c - 1);
	}
}
function S(t, e, n, r) {
	L(t, n, r), L(e, 2 * n, 2 * r), L(e, 2 * n + 1, 2 * r + 1);
}
function L(t, e, n) {
	const r = t[e];
	t[e] = t[n], t[n] = r;
}
function I(t, e, n, r) {
	const i = t - n, s = e - r;
	return i * i + s * s;
}
function T(t, e, n = 0) {
	const r = 6378137, i = 6356752.314245179, s = r * r, o = i * i;
	t *= Math.PI / 180, e *= Math.PI / 180;
	const a = Math.cos(e), c = a * Math.cos(t), u = a * Math.sin(t), l = Math.sin(e);
	let h = s * c, f = s * u, d = o * l;
	const p = Math.sqrt(c * h + u * f + l * d);
	return h /= p, f /= p, d /= p, {
		x: h + c * n,
		y: f + u * n,
		z: d + l * n
	};
}
function N(t) {
	return 180 * t / Math.PI;
}
function P(t) {
	return "string" == typeof t ? t.split(",") : void 0 === t ? [] : [t];
}
function R(t) {
	return {
		near: Number.isFinite(t.near) ? Math.max(0, t.near) : 0,
		far: "number" != typeof t.far || Number.isNaN(t.far) ? 1 / 0 : t.far
	};
}
var z = ((e, n) => {
	let r = {};
	for (var i in e) t(r, i, {
		get: e[i],
		enumerable: !0
	});
	return n || t(r, Symbol.toStringTag, { value: "Module" }), r;
})({
	cancelPromise: () => F,
	checkRectangleIsIntersect: () => G,
	clear: () => q,
	deleteLabelRectangle: () => K,
	filterByBounds: () => O,
	getFilterPointsList: () => D,
	getLabelEntities: () => j,
	getLabelPointList: () => B,
	isOverlapping: () => W,
	isPointOnFrontOfGlobe: () => $,
	loadLabelPoints: () => k,
	queryVisiblePoints: () => C
});
const H = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Map();
async function k(t, e, n) {
	if (!t || H.has(t) || U.has(t)) return;
	const r = new AbortController();
	U.set(t, r);
	try {
		const i = await fetch(e, { signal: r.signal });
		if (!i.ok) throw new Error(`Failed to load labels: HTTP ${i.status}`);
		const s = await i.json();
		if (r.signal.aborted || U.get(t) !== r) return;
		const o = function(t, e) {
			if (!Array.isArray(t?.features)) throw new Error("GeoJSON features must be an array.");
			const n = [e, ...(e.children ?? []).map((t) => ({
				...e,
				...t
			}))], r = new Set(P(e.excludeValue)), i = /* @__PURE__ */ new Map();
			(e.children ?? []).forEach((t, e) => {
				for (const n of P(t.includeValue)) i.has(n) || i.set(n, e + 1);
			});
			const s = n.map(R), o = [], a = e.labelField ?? "name", c = e.filterField ?? a;
			let u = 1 / 0, l = 0;
			for (const h of t.features) {
				if (!h?.properties || "Point" !== h.geometry?.type) continue;
				const t = h.geometry.coordinates;
				if (!Array.isArray(t) || !Number.isFinite(t[0]) || !Number.isFinite(t[1]) || Math.abs(t[0]) > 180 || Math.abs(t[1]) > 90) continue;
				const e = h.properties[a];
				if ("string" != typeof e && "number" != typeof e || "number" == typeof e && !Number.isFinite(e)) continue;
				const f = String(e);
				if (!f.trim()) continue;
				const d = h.properties[c], p = r.has(d) ? i.get(d) : 0;
				if (void 0 === p) continue;
				const y = n[p], g = s[p];
				if (g.far < g.near) continue;
				const m = 1.2 * (y.fontSize ?? 10);
				o.push({
					id: o.length,
					name: f,
					longitude: t[0],
					latitude: t[1],
					position: T(t[0], t[1]),
					minHeight: g.near,
					maxHeight: g.far,
					textWidth: m * f.length,
					textHeight: m,
					styleId: p
				}), u = Math.min(u, g.near), l = Math.max(l, g.far);
			}
			return {
				points: o,
				styles: n,
				minHeight: o.length ? u : 0,
				maxHeight: l
			};
		}(s, n), a = new A(o.points.length);
		for (const t of o.points) a.add(t.longitude, t.latitude);
		return a.finish(), H.set(t, {
			indexKDB: a,
			ptList: o.points,
			styles: o.styles,
			idRectMap: /* @__PURE__ */ new Map()
		}), {
			minHeight: o.minHeight,
			maxHeight: o.maxHeight,
			styles: o.styles
		};
	} catch (t) {
		if (r.signal.aborted) return;
		throw t;
	} finally {
		U.get(t) === r && U.delete(t);
	}
}
function F(t) {}
function O(t, e, n, r = !1) {
	const i = H.get(t);
	if (!e || !i) return;
	const s = N(e.west), o = N(e.east), a = N(e.south), c = N(e.north);
	if (![
		s,
		o,
		a,
		c
	].every(Number.isFinite) || a > c) return [];
	const u = s <= o ? i.indexKDB.range(s, a, o, c) : [...i.indexKDB.range(s, a, 180, c), ...i.indexKDB.range(-180, a, o, c)];
	return n < 0 ? u : u.filter((t) => {
		const e = i.ptList[t];
		return void 0 !== e.minHeight && void 0 !== e.maxHeight ? n >= e.minHeight && n <= e.maxHeight : r;
	});
}
function _(t, e, n = !1) {
	const { longitude: r, latitude: i, ...s } = t;
	return n && t.styleId > 0 && (s.itemStyleContent = e.styles[t.styleId]), s;
}
function C(t, e, n, r = [], i = 1 / 0, s = !1) {
	const o = H.get(t);
	if (!o) return;
	let a = O(t, e, n) ?? [];
	const c = new Set(r);
	return (s || Number.isFinite(i)) && a.sort((t, e) => {
		const n = o.styles[o.ptList[t].styleId].weight ?? 0;
		return (o.styles[o.ptList[e].styleId].weight ?? 0) - n || Number(c.has(e)) - Number(c.has(t)) || t - e;
	}), Number.isFinite(i) && (a = a.slice(0, Math.max(0, Math.floor(i)))), {
		ids: a,
		points: a.filter((t) => !c.has(t)).map((t) => _(o.ptList[t], o))
	};
}
function D(t, e) {
	const n = H.get(t);
	if (n) return e.filter((t) => !!n.ptList[t]).map((t) => _(n.ptList[t], n, !0));
}
const j = D, B = D;
function $(t, e) {
	return function(t, e) {
		const n = t.x - e.x, r = t.y - e.y, i = t.z - e.z;
		return Math.sqrt(n * n + r * r + i * i);
	}(t, e) <= 6371e3;
}
function G(t, e, n) {
	const r = H.get(t);
	if (!r) return !1;
	for (const [i, s] of r.idRectMap) if (i !== n && W(s, e)) return !0;
	return r.idRectMap.set(n, e), !1;
}
function K(t, e) {
	return H.get(t)?.idRectMap.delete(e) ?? !1;
}
function W(t, e) {
	return !(t.x > e.x + e.width || e.x > t.x + t.width || t.y > e.y + e.height || e.y > t.y + t.height);
}
function q(t) {
	U.get(t)?.abort(), U.delete(t), H.delete(t);
}
c(z);
