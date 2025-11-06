import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { payrunApi } from "@/api/payruns";
import { employeeApi } from "@/api/employees";
import {
  formatCurrency,
  formatDateReadable,
  formatHours,
} from "@/utils/format";

export default function PayRunSummary() {
  const { payrunId } = useParams<{ payrunId: string }>();

  const {
    data: singlePayrun,
    isLoading: singlePayrunLoading,
    error: singlePayrunError,
  } = useQuery({
    queryKey: ["payruns", payrunId!],
    queryFn: () => payrunApi.getById(payrunId!),
    enabled: !!payrunId,
  });

  const {
    data: allPayruns,
    isLoading: allPayrunsLoading,
    error: allPayrunsError,
  } = useQuery({
    queryKey: ["payruns"],
    queryFn: () => payrunApi.getAll(),
    enabled: !payrunId,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.getAll(),
    enabled: !!payrunId && !!singlePayrun,
  });

  const payrun = singlePayrun || null;
  const payruns = allPayruns || [];
  const isLoading = singlePayrunLoading || allPayrunsLoading;
  const error = singlePayrunError || allPayrunsError;

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find((emp) => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId;
  };

  if (error) {
    toast.error("Failed to load payrun data");
  }

  if (payrunId && payrun) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pay Run Summary</h1>
          <p className="mt-2 text-sm text-gray-600">Payrun ID: {payrun.id}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payrun Details</CardTitle>
            <CardDescription>
              Period: {formatDateReadable(payrun.periodStart)} -{" "}
              {formatDateReadable(payrun.periodEnd)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payrun.payslips.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No payslips found for this payrun
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Employee</TableHead>
                    <TableHead scope="col" className="text-right">
                      Normal Hours
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Overtime Hours
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Gross
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Tax
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Super
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Net
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrun.payslips.map((payslip) => (
                    <TableRow key={payslip.employeeId}>
                      <TableCell className="font-medium">
                        {getEmployeeName(payslip.employeeId)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatHours(payslip.normalHours)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatHours(payslip.overtimeHours)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payslip.gross)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payslip.tax)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payslip.super)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payslip.net)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/payslips/${payslip.employeeId}/${payrun.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          View Payslip
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-semibold">
                      Totals
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payrun.totals.gross)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payrun.totals.tax)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payrun.totals.super)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payrun.totals.net)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pay Run Summary</h1>
        <p className="mt-2 text-sm text-gray-600">
          View all pay runs and access individual payslips
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pay Run History</CardTitle>
          <CardDescription>
            View and manage all generated pay runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-gray-600 text-center py-8">Loading payruns...</p>
          )}
          {payruns.length === 0 && !isLoading && (
            <p className="text-gray-600 text-center py-8">
              No payruns found. Generate one from the Run Pay page.
            </p>
          )}
          {payruns.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Payrun ID</TableHead>
                  <TableHead scope="col">Period Start</TableHead>
                  <TableHead scope="col">Period End</TableHead>
                  <TableHead scope="col" className="text-right">
                    Gross Total
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Net Total
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Payslips
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payruns.map((payrun) => (
                  <TableRow key={payrun.id}>
                    <TableCell className="font-medium">{payrun.id}</TableCell>
                    <TableCell>
                      {formatDateReadable(payrun.periodStart)}
                    </TableCell>
                    <TableCell>
                      {formatDateReadable(payrun.periodEnd)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payrun.totals.gross)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payrun.totals.net)}
                    </TableCell>
                    <TableCell className="text-right">
                      {payrun.payslips.length}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/payruns/${payrun.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
