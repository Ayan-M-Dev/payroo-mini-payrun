import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { employeeApi } from "@/api/employees";
import { formatCurrency } from "@/utils/format";
import type { Employee } from "@/types/api";

const employeeFormSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  baseHourlyRate: z.number().positive("Hourly rate must be positive"),
  superRate: z
    .number()
    .min(0, "Super rate must be at least 0")
    .max(1, "Super rate must be at most 1"),
  bankBSB: z.string(),
  bankAccount: z.string(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

export default function Employees() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const {
    data: employees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      baseHourlyRate: 0,
      superRate: 0.115,
      bankBSB: "",
      bankAccount: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: employeeApi.createOrUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee saved successfully");
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save employee");
    },
  });

  const openAddDialog = () => {
    setEditingEmployee(null);
    reset({
      id: "",
      firstName: "",
      lastName: "",
      baseHourlyRate: 0,
      superRate: 0.115,
      bankBSB: "",
      bankAccount: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      baseHourlyRate: employee.baseHourlyRate,
      superRate: employee.superRate,
      bankBSB: employee.bank?.bsb || "",
      bankAccount: employee.bank?.account || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: EmployeeFormData) => {
    const employeeData: Employee = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      type: "hourly",
      baseHourlyRate: data.baseHourlyRate,
      superRate: data.superRate,
      bank:
        data.bankBSB && data.bankAccount
          ? {
              bsb: data.bankBSB,
              account: data.bankAccount,
            }
          : undefined,
    };

    createMutation.mutate(employeeData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage employee information and pay rates
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>
            View and manage all employee records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-gray-600 text-center py-8">
              Loading employees...
            </p>
          )}
          {error && (
            <p className="text-red-600 text-center py-8">
              Error loading employees. Please try again.
            </p>
          )}
          {employees && employees.length === 0 && (
            <p className="text-gray-600 text-center py-8">No employees found</p>
          )}
          {employees && employees.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">ID</TableHead>
                  <TableHead scope="col">Name</TableHead>
                  <TableHead scope="col">Hourly Rate</TableHead>
                  <TableHead scope="col">Super Rate</TableHead>
                  <TableHead scope="col">Bank Details</TableHead>
                  <TableHead scope="col" className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(employee.baseHourlyRate)}
                    </TableCell>
                    <TableCell>
                      {(employee.superRate * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {employee.bank
                        ? `${employee.bank.bsb} / ${employee.bank.account}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(employee)}
                        className="gap-2"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee
                ? "Update employee information below."
                : "Fill in the details to add a new employee."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">
                  Employee ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="id"
                  {...register("id")}
                  disabled={!!editingEmployee}
                  aria-invalid={errors.id ? "true" : "false"}
                  aria-describedby={errors.id ? "id-error" : undefined}
                />
                {errors.id && (
                  <p id="id-error" className="text-sm text-red-600">
                    {errors.id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  aria-invalid={errors.firstName ? "true" : "false"}
                  aria-describedby={
                    errors.firstName ? "firstName-error" : undefined
                  }
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                aria-invalid={errors.lastName ? "true" : "false"}
                aria-describedby={
                  errors.lastName ? "lastName-error" : undefined
                }
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseHourlyRate">
                  Base Hourly Rate (AUD) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="baseHourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("baseHourlyRate", { valueAsNumber: true })}
                  aria-invalid={errors.baseHourlyRate ? "true" : "false"}
                  aria-describedby={
                    errors.baseHourlyRate ? "baseHourlyRate-error" : undefined
                  }
                />
                {errors.baseHourlyRate && (
                  <p id="baseHourlyRate-error" className="text-sm text-red-600">
                    {errors.baseHourlyRate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="superRate">
                  Super Rate (0-1) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="superRate"
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  {...register("superRate", { valueAsNumber: true })}
                  aria-invalid={errors.superRate ? "true" : "false"}
                  aria-describedby={
                    errors.superRate ? "superRate-error" : undefined
                  }
                />
                {errors.superRate && (
                  <p id="superRate-error" className="text-sm text-red-600">
                    {errors.superRate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankBSB">Bank BSB</Label>
                <Input
                  id="bankBSB"
                  {...register("bankBSB")}
                  placeholder="083-123"
                  aria-invalid={errors.bankBSB ? "true" : "false"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  {...register("bankAccount")}
                  placeholder="12345678"
                  aria-invalid={errors.bankAccount ? "true" : "false"}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? "Saving..."
                  : editingEmployee
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
