import AdminLayout from "../layout/AdminLayout";
import CustomersManager from "../CustomersManager/CustomersManager";

export default function CustomersPage() {
  return (
    <AdminLayout>
      <CustomersManager />
    </AdminLayout>
  );
}
