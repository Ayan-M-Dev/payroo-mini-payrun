import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout/Layout";
import AuthGuard from "./components/AuthGuard";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Timesheets from "./pages/Timesheets";
import RunPay from "./pages/RunPay";
import PayRunSummary from "./pages/PayRunSummary";
import Payslip from "./pages/Payslip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/employees" replace />} />
            <Route path="employees" element={<Employees />} />
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="run-pay" element={<RunPay />} />
            <Route path="payruns" element={<PayRunSummary />} />
            <Route path="payruns/:payrunId" element={<PayRunSummary />} />
            <Route
              path="payslips/:employeeId/:payrunId"
              element={<Payslip />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
