import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeApi } from "@/api/employees";
import { timesheetApi } from "@/api/timesheets";
import type { Timesheet } from "@/types/api";

const timesheetSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  periodStart: z.string().min(1, "Period start date is required"),
  periodEnd: z.string().min(1, "Period end date is required"),
  entries: z
    .array(
      z.object({
        date: z.string().min(1, "Date is required"),
        start: z
          .string()
          .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
        end: z
          .string()
          .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
        unpaidBreakMins: z
          .number()
          .min(0, "Break minutes must be non-negative"),
      })
    )
    .min(1, "At least one entry is required"),
  allowances: z.number().min(0, "Allowances must be non-negative"),
});

type TimesheetFormData = z.infer<typeof timesheetSchema>;

export default function Timesheets() {
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.getAll(),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TimesheetFormData>({
    resolver: zodResolver(timesheetSchema),
    defaultValues: {
      employeeId: "",
      periodStart: "",
      periodEnd: "",
      entries: [{ date: "", start: "", end: "", unpaidBreakMins: 0 }],
      allowances: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const periodStart = watch("periodStart");
  const periodEnd = watch("periodEnd");

  const createMutation = useMutation({
    mutationFn: timesheetApi.createOrUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Timesheet saved successfully");
      reset();
      setSelectedEmployee("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save timesheet");
    },
  });

  const onSubmit = (data: TimesheetFormData) => {
    const timesheetData: Timesheet = {
      employeeId: data.employeeId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      entries: data.entries,
      allowances: data.allowances,
    };

    createMutation.mutate(timesheetData);
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setValue("employeeId", employeeId);
  };

  const addEntry = () => {
    append({ date: periodStart || "", start: "", end: "", unpaidBreakMins: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
        <p className="mt-2 text-sm text-gray-600">
          Record employee work hours and breaks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Timesheet</CardTitle>
          <CardDescription>
            Select employee and date range, then add work entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">
                  Employee <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedEmployee}
                  onValueChange={handleEmployeeChange}
                >
                  <SelectTrigger
                    id="employeeId"
                    aria-invalid={errors.employeeId ? "true" : "false"}
                  >
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : employees && employees.length > 0 ? (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.id})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No employees found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-red-600">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>

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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Work Entries</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntry}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </div>

              {errors.entries && (
                <p className="text-sm text-red-600">{errors.entries.message}</p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`entries.${index}.date`}>
                            Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`entries.${index}.date`}
                            type="date"
                            {...register(`entries.${index}.date` as const)}
                            min={periodStart || undefined}
                            max={periodEnd || undefined}
                            aria-invalid={
                              errors.entries?.[index]?.date ? "true" : "false"
                            }
                          />
                          {errors.entries?.[index]?.date && (
                            <p className="text-xs text-red-600">
                              {errors.entries[index]?.date?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`entries.${index}.start`}>
                            Start Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`entries.${index}.start`}
                            type="time"
                            {...register(`entries.${index}.start` as const)}
                            placeholder="09:00"
                            aria-invalid={
                              errors.entries?.[index]?.start ? "true" : "false"
                            }
                          />
                          {errors.entries?.[index]?.start && (
                            <p className="text-xs text-red-600">
                              {errors.entries[index]?.start?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`entries.${index}.end`}>
                            End Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`entries.${index}.end`}
                            type="time"
                            {...register(`entries.${index}.end` as const)}
                            placeholder="17:30"
                            aria-invalid={
                              errors.entries?.[index]?.end ? "true" : "false"
                            }
                          />
                          {errors.entries?.[index]?.end && (
                            <p className="text-xs text-red-600">
                              {errors.entries[index]?.end?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`entries.${index}.unpaidBreakMins`}>
                            Break (mins)
                          </Label>
                          <Input
                            id={`entries.${index}.unpaidBreakMins`}
                            type="number"
                            min="0"
                            {...register(
                              `entries.${index}.unpaidBreakMins` as const,
                              {
                                valueAsNumber: true,
                              }
                            )}
                            aria-invalid={
                              errors.entries?.[index]?.unpaidBreakMins
                                ? "true"
                                : "false"
                            }
                          />
                          {errors.entries?.[index]?.unpaidBreakMins && (
                            <p className="text-xs text-red-600">
                              {errors.entries[index]?.unpaidBreakMins?.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-end">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                              className="w-full gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowances">Allowances (AUD)</Label>
              <Input
                id="allowances"
                type="number"
                step="0.01"
                min="0"
                {...register("allowances", { valueAsNumber: true })}
                aria-invalid={errors.allowances ? "true" : "false"}
              />
              {errors.allowances && (
                <p className="text-sm text-red-600">
                  {errors.allowances.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedEmployee("");
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Timesheet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
