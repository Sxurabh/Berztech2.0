"use client";

import { motion } from "framer-motion";
import { FiSearch, FiChevronUp, FiChevronDown, FiMoreVertical } from "react-icons/fi";
import { useState, useMemo } from "react";
import { CornerFrame } from "@/components/ui/CornerFrame";

export default function DataTable({
    columns,
    data,
    searchKey,
    actions,
    emptyMessage = "No items found",
    emptyIcon,
    gridView = false,
    renderGridItem = null,
}) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [mobileActionOpen, setMobileActionOpen] = useState(null);

    const filteredData = useMemo(() => {
        let result = data || [];

        if (search && searchKey) {
            const lowerSearch = search.toLowerCase();
            result = result.filter((item) =>
                String(item[searchKey] || "")
                    .toLowerCase()
                    .includes(lowerSearch)
            );
        }

        if (sortKey) {
            result = [...result].sort((a, b) => {
                const aVal = a[sortKey] ?? "";
                const bVal = b[sortKey] ?? "";
                const cmp = String(aVal).localeCompare(String(bVal));
                return sortDir === "asc" ? cmp : -cmp;
            });
        }

        return result;
    }, [data, search, searchKey, sortKey, sortDir]);

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    return (
        <div>
            {/* Search */}
            {searchKey && (
                <div className="relative mb-6">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 font-jetbrains-mono text-sm transition-all rounded-sm shadow-sm"
                    />
                </div>
            )}

            {/* Mobile: Card View */}
            <div className="lg:hidden space-y-3">
                {filteredData.length === 0 ? (
                    <CornerFrame
                        className="text-center py-12 bg-neutral-50/50 border border-neutral-100 h-full"
                        bracketClassName="w-2.5 h-2.5 border-neutral-300"
                    >
                        <div className="text-neutral-500 font-jetbrains-mono text-sm uppercase tracking-widest font-medium">
                            {emptyIcon && <div className="mb-3 text-2xl flex justify-center text-neutral-400">{emptyIcon}</div>}
                            {emptyMessage}
                        </div>
                    </CornerFrame>
                ) : (
                    filteredData.map((item, i) => (
                        <motion.div
                            key={item.id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            {gridView && renderGridItem ? renderGridItem(item) : (
                                <div className="bg-white border border-neutral-200 p-4 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                                    <div className="space-y-3">
                                        {columns.map((col) => (
                                            <div key={col.key} className="flex justify-between items-start gap-3">
                                                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                                    {col.label}
                                                </span>
                                                <div className="text-right flex-1 min-w-0">
                                                    {col.render ? col.render(item) : (
                                                        <span className="text-sm font-space-grotesk font-medium text-neutral-900 break-words">
                                                            {item[col.key]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Mobile Actions */}
                                        {actions && (
                                            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-end gap-1.5">
                                                {actions(item)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
                {gridView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredData.length === 0 ? (
                            <div className="col-span-full">
                                <CornerFrame
                                    className="text-center py-12 bg-neutral-50/50 border border-neutral-100 h-full"
                                    bracketClassName="w-2.5 h-2.5 border-neutral-300"
                                >
                                    <div className="text-neutral-500 font-jetbrains-mono text-sm uppercase tracking-widest font-medium">
                                        {emptyIcon && <div className="mb-3 text-2xl flex justify-center text-neutral-400">{emptyIcon}</div>}
                                        {emptyMessage}
                                    </div>
                                </CornerFrame>
                            </div>
                        ) : (
                            filteredData.map((item) => renderGridItem && renderGridItem(item))
                        )}
                    </div>
                ) : (
                    <CornerFrame
                        className="bg-white border border-neutral-200"
                        bracketClassName="w-2.5 h-2.5 border-neutral-400"
                    >
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                            <table className="w-full relative">
                                <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
                                    <tr>
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => col.sortable && toggleSort(col.key)}
                                                className={`
                                                    px-5 py-3.5 text-left text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-medium whitespace-nowrap
                                                    ${col.sortable ? "cursor-pointer hover:text-neutral-900 transition-colors select-none" : ""}
                                                    ${col.className || ""}
                                                `}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {col.label}
                                                    {col.sortable && sortKey === col.key && (
                                                        sortDir === "asc" ? <FiChevronUp className="w-3 h-3 text-neutral-400" /> : <FiChevronDown className="w-3 h-3 text-neutral-400" />
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                        {actions && (
                                            <th className="px-5 py-3.5 text-right text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-medium">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={columns.length + (actions ? 1 : 0)}
                                                className="px-5 py-12 text-center"
                                            >
                                                <div className="text-neutral-500 font-jetbrains-mono text-sm uppercase tracking-widest font-medium">
                                                    {emptyIcon && <div className="mb-3 text-2xl flex justify-center text-neutral-400">{emptyIcon}</div>}
                                                    {emptyMessage}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((item, i) => (
                                            <motion.tr
                                                key={item.id || i}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="hover:bg-neutral-50/80 transition-colors group"
                                            >
                                                {columns.map((col) => (
                                                    <td key={col.key} className={`px-5 py-3 ${col.className || ""}`}>
                                                        {col.render ? col.render(item) : (
                                                            <span className="text-sm font-space-grotesk font-medium text-neutral-900">
                                                                {item[col.key]}
                                                            </span>
                                                        )}
                                                    </td>
                                                ))}
                                                {actions && (
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 transition-opacity">
                                                            {actions(item)}
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CornerFrame>
                )}
            </div>

            {/* Results count */}
            <div className="mt-3 text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-widest">
                {filteredData.length} {filteredData.length === 1 ? "item" : "items"}
                {search && ` matching "${search}"`}
            </div>
        </div>
    );
}