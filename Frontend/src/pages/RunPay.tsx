import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeApi } from "@/api/employees";
import { payrunApi } from "@/api/payruns";
import { formatCurrency, formatDateReadable } from "@/utils/format";
import type { Payrun } from "@/types/api";

const payrunRequestSchema = z.object({
  periodStart: z.string().min(1, "Period start date is required"),
  periodEnd: z.string().min(1, "Period end date is required"),
  employeeIds: z.array(z.string()).optional(),
});

type PayrunRequestFormData = z.infer<typeof payrunRequestSchema>;

export default function RunPay() {
  const [generatedPayrun, setGeneratedPayrun] = useState<Payrun | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.getAll(),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PayrunRequestFormData>({
    resolver: zodResolver(payrunRequestSchema),
    defaultValues: {
      periodStart: "",
      periodEnd: "",
      employeeIds: [],
    },
  });

  const periodStart = watch("periodStart");
  const periodEnd = watch("periodEnd");

  const generateMutation = useMutation({
    mutationFn: payrunApi.generate,
    onSuccess: (data) => {
      setGeneratedPayrun(data);
      toast.success("Payrun generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate payrun");
    },
  });

  const onSubmit = (data: PayrunRequestFormData) => {
    const request = {
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      employeeIds: selectedEmployees.length > 0 ? selectedEmployees : undefined,
    };

    generateMutation.mutate(request);
  };

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAll = () => {
    if (employees) {
      setSelectedEmployees(employees.map((emp) => emp.id));
    }
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Run Pay</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate pay runs for selected employees and date ranges
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Payrun</CardTitle>
          <CardDescription>
            Select date range and optionally filter by employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodStart">
                  Period Start <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="periodStart"
                  type="date"
                  {...register("periodStart")}
                  max={periodEnd || undefined}
                  aria-invalid={errors.periodStart ? "true" : "false"}
                />
                {errors.periodStart && (
                  <p className="text-sm text-red-600">
                    {errors.periodStart.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodEnd">
                  Period End <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="periodEnd"
                  type="date"
                  {...register("periodEnd")}
                  min={periodStart || undefined}
                  aria-invalid={errors.periodEnd ? "true" : "false"}
                />
                {errors.periodEnd && (
                  <p className="text-sm text-red-600">
                    {errors.periodEnd.message}
                  </p>
                )}
              </div>
            </div>

            {employeesLoading ? (
              <p className="text-gray-600">Loading employees...</p>
            ) : employees && employees.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Employees (Optional)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {selectedEmployees.length === 0
                    ? "Leave empty to include all employees"
                    : `${selectedEmployees.length} employee(s) selected`}
                </p>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                  {employees.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {employee.firstName} {employee.lastName} ({employee.id})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No employees found</p>
            )}

            <Button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full gap-2"
            >
              <Calculator className="h-4 w-4" />
              {generateMutation.isPending ? "Generating..." : "Generate Payrun"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedPayrun && (
        <Card>
          <CardHeader>
            <CardTitle>Payrun Generated</CardTitle>
            <CardDescription>Payrun ID: {generatedPayrun.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Period: {formatDateReadable(generatedPayrun.periodStart)} -{" "}
                {formatDateReadable(generatedPayrun.periodEnd)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Totals</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Gross:</div>
                <div className="font-medium">
                  {formatCurrency(generatedPayrun.totals.gross)}
                </div>
                <div>Tax:</div>
                <div className="font-medium">
                  {formatCurrency(generatedPayrun.totals.tax)}
                </div>
                <div>Super:</div>
                <div className="font-medium">
                  {formatCurrency(generatedPayrun.totals.super)}
                </div>
                <div>Net:</div>
                <div className="font-medium">
                  {formatCurrency(generatedPayrun.totals.net)}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {generatedPayrun.payslips.length} payslip(s) generated
              </p>
            </div>
            <Link to={`/payruns/${generatedPayrun.id}`} className="w-full">
              <Button className="w-full">View Pay Run Summary</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
