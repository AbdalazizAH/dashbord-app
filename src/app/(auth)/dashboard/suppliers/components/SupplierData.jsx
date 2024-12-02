"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { suppliersApi } from "@/utils/api/suppliers";
import SupplierTable from "./SupplierTable";

export default function SupplierData({ searchTerm, onEdit, onDelete }) {
  // جلب الموردين باستخدام useSuspenseQuery
  const { data: suppliers = [] } = useSuspenseQuery({
    queryKey: ["suppliers"],
    queryFn: suppliersApi.getSuppliers,
  });

  // تصفية الموردين حسب البحث
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.SupplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.ContactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SupplierTable
      suppliers={filteredSuppliers}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
