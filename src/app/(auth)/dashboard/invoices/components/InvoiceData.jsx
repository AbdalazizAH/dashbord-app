"use client";
import InvoiceTable from "./InvoiceTable";

export default function InvoiceData({
  invoices,
  suppliers,
  filters,
  searchTerm,
  onEdit,
  onDelete,
  onComplete,
  loadingInvoiceId,
  setLoadingInvoiceId,
}) {
  return (
    <InvoiceTable
      invoices={invoices}
      suppliers={suppliers}
      filters={filters}
      searchTerm={searchTerm}
      onEdit={onEdit}
      onDelete={onDelete}
      onComplete={onComplete}
      loadingInvoiceId={loadingInvoiceId}
      setLoadingInvoiceId={setLoadingInvoiceId}
    />
  );
} 