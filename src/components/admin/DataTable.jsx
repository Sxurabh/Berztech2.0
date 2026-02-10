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
                <div className="relative mb-4">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none font-jetbrains-mono text-sm rounded-sm"
                    />
                </div>
            )}

            {/* Mobile: Card View */}
            <div className="lg:hidden space-y-3">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12 border border-neutral-200 rounded-sm">
                        <div className="text-neutral-500 font-jetbrains-mono text-sm">
                            {emptyIcon && <div className="mb-2 text-2xl">{emptyIcon}</div>}
                            {emptyMessage}
                        </div>
                    </div>
                ) : (
                    filteredData.map((item, i) => (
                        <motion.div
                            key={item.id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <CornerFrame
                                className="bg-white border-neutral-200 p-4"
                                bracketClassName="w-2 h-2 border-neutral-300"
                            >
                                <div className="space-y-2">
                                    {columns.map((col) => (
                                        <div key={col.key} className="flex justify-between items-start">
                                            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                                {col.label}
                                            </span>
                                            <div className="text-right">
                                                {col.render ? col.render(item) : (
                                                    <span className="text-sm text-neutral-900">
                                                        {item[col.key]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Mobile Actions */}
                                    {actions && (
                                        <div className="pt-3 mt-3 border-t border-neutral-100">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions(item)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CornerFrame>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden lg:block overflow-x-auto border border-neutral-200 rounded-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable && toggleSort(col.key)}
                                    className={`
                                        px-4 py-3 text-left text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500
                                        ${col.sortable ? "cursor-pointer hover:text-neutral-900 select-none" : ""}
                                        ${col.className || ""}
                                    `}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            sortDir === "asc" ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-3 text-right text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="text-neutral-500 font-jetbrains-mono text-sm">
                                        {emptyIcon && <div className="mb-2 text-2xl">{emptyIcon}</div>}
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
                                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                                            {col.render ? col.render(item) : (
                                                <span className="text-sm text-neutral-900">
                                                    {item[col.key]}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
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

            {/* Results count */}
            <div className="mt-3 text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-widest">
                {filteredData.length} {filteredData.length === 1 ? "item" : "items"}
                {search && ` matching "${search}"`}
            </div>
        </div>
    );
}