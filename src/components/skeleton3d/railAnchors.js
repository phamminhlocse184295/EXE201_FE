/**
 * Thu thập điểm neo trên màn hình (pixel) để xương chạy/nhảy dọc menu, bar, card, bảng dữ liệu.
 */

export const RAIL_SELECTORS = [
  ".mgr-topbar",
  ".admin-topbar",
  ".mgr-sidebar",
  ".admin-sidebar",
  ".mgr-nav-link",
  ".admin-nav-link",
  ".mgr-brand",
  ".admin-brand",
  ".mgr-page .ant-card",
  ".admin-page .ant-card",
  ".mgr-page .ant-table",
  ".admin-page .ant-table",
  ".mgr-page .ant-table-wrapper",
  ".admin-page .ant-table-wrapper",
  ".mgr-page .recharts-wrapper",
  ".admin-page .recharts-wrapper",
  ".mgr-page .ant-list",
  ".admin-page .ant-list",
  ".ant-statistic",
  "[data-skel-rail]",
];

function isTopbar(el) {
  return el?.matches?.(".mgr-topbar, .admin-topbar, header.mgr-topbar, header.admin-topbar");
}

function isSidebar(el) {
  return el?.matches?.(".mgr-sidebar, .admin-sidebar, aside.mgr-sidebar, aside.admin-sidebar");
}

/**
 * @returns {{ cx: number, cy: number }[]}
 */
export function collectClientAnchors() {
  const raw = [];

  for (const sel of RAIL_SELECTORS) {
    let nodes;
    try {
      nodes = document.querySelectorAll(sel);
    } catch {
      continue;
    }

    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 8) return;
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (r.right < 0 || r.left > window.innerWidth) return;

      if (isTopbar(el)) {
        const n = 5;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          raw.push({
            cx: r.left + r.width * t,
            cy: r.top + r.height * 0.4,
          });
        }
      } else if (isSidebar(el)) {
        const n = 7;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          raw.push({
            cx: r.left + r.width * 0.55,
            cy: r.top + 18 + (r.height - 36) * t,
          });
        }
      } else {
        raw.push({
          cx: r.left + r.width * 0.5,
          cy: r.top + Math.min(14, r.height * 0.22),
        });
      }
    });
  }

  const seen = new Set();
  const dedup = [];
  for (const p of raw) {
    const key = `${Math.round(p.cx / 32)}_${Math.round(p.cy / 32)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(p);
  }

  dedup.sort((a, b) => a.cy - b.cy || a.cx - b.cx);
  return dedup;
}
