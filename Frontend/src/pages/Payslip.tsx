import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { payrunApi } from "@/api/payruns";
import { employeeApi } from "@/api/employees";
import {
  formatCurrency,
  formatDateReadable,
  formatHours,
} from "@/utils/format";

export default function Payslip() {
  const { employeeId, payrunId } = useParams<{
    employeeId: string;
    payrunId: string;
  }>();

  const {
    data: payslip,
    isLoading: payslipLoading,
    error: payslipError,
  } = useQuery({
    queryKey: ["payslip", employeeId, payrunId],
    queryFn: () =>
      employeeId && payrunId
        ? payrunApi.getPayslip(employeeId, payrunId)
        : Promise.reject(new Error("Missing parameters")),
    enabled: !!employeeId && !!payrunId,
  });

  const { data: payrun } = useQuery({
    queryKey: ["payruns", payrunId],
    queryFn: () => (payrunId ? payrunApi.getById(payrunId) : null),
    enabled: !!payrunId,
  });

  const { data: employee } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.getAll(),
  });

  const currentEmployee = employee?.find((emp) => emp.id === employeeId);

  if (payslipError) {
    toast.error("Failed to load payslip");
  }

  if (!employeeId || !payrunId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">
              Invalid payslip parameters
            </p>
            <Link to="/payruns">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Pay Runs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (payslipLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">Loading payslip...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">Payslip not found</p>
            <Link to="/payruns">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Pay Runs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payslip</h1>
          <p className="mt-2 text-sm text-gray-600">
            Employee:{" "}
            {currentEmployee
              ? `${currentEmployee.firstName} ${currentEmployee.lastName}`
              : employeeId}
          </p>
        </div>
        <Link to={payrunId ? `/payruns/${payrunId}` : "/payruns"}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payslip Details</CardTitle>
          <CardDescription>
            {payrun
              ? `Period: ${formatDateReadable(payrun.periodStart)} - ${formatDateReadable(payrun.periodEnd)}`
              : `Payrun ID: ${payrunId}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentEmployee && (
            <div>
              <h3 className="font-semibold mb-2">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>{" "}
                  <span className="font-medium">
                    {currentEmployee.firstName} {currentEmployee.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Employee ID:</span>{" "}
                  <span className="font-medium">{currentEmployee.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Hourly Rate:</span>{" "}
                  <span className="font-medium">
                    {formatCurrency(currentEmployee.baseHourlyRate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Super Rate:</span>{" "}
                  <span className="font-medium">
                    {(currentEmployee.superRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Hours Breakdown</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Normal Hours:</span>{" "}
                <span className="font-medium">
                  {formatHours(payslip.normalHours)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Overtime Hours:</span>{" "}
                <span className="font-medium">
                  {formatHours(payslip.overtimeHours)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Total Hours:</span>{" "}
                <span className="font-medium">
                  {formatHours(payslip.normalHours + payslip.overtimeHours)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Pay Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gross Pay:</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(payslip.gross)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  {formatCurrency(payslip.tax)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Superannuation:</span>
                <span className="font-medium">
                  {formatCurrency(payslip.super)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Net Pay:</span>
                <span className="font-bold text-xl text-primary">
                  {formatCurrency(payslip.net)}
                </span>
              </div>
            </div>
          </div>

          {currentEmployee?.bank && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Bank Details</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    BSB: {currentEmployee.bank.bsb} | Account:{" "}
                    {currentEmployee.bank.account}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
