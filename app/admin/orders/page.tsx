import AdminLayout from "../layout/AdminLayout";
import OrdersManager from "../OrdersManager/OrdersManager";

export default function OrdersPage() {
  return (
    <AdminLayout>
      <OrdersManager />
    </AdminLayout>
  );
}
