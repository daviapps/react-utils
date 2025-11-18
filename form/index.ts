import { AxiosError } from "axios";
// import type { FieldValues, UseFormReturn } from "react-hook-form";
import z, {
  ZodArray,
  ZodBoolean,
  ZodDefault,
  ZodEffects,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodSchema,
  ZodString,
} from "zod/v3";

export function zodSchemaDefaults<S extends ZodObject<any>, T = z.infer<S>>(
  schema: S,
  overrides?: T
): any {
  return (Object.entries(schema._def.shape()) as [keyof T, ZodSchema][]).reduce(
    (acc, [key, value]) => {
      const defaultValue = overrides && overrides[key];

      if (value instanceof ZodObject) {
        acc[key] = zodSchemaDefaults(
          value,
          defaultValue
        ) as unknown as T[keyof T];
      } else if (
        value instanceof ZodArray ||
        (value instanceof ZodEffects && value._def.schema instanceof ZodArray)
      ) {
        acc[key] = [] as unknown as T[keyof T];
      } else if (value instanceof ZodDefault) {
        acc[key] =
          defaultValue ?? (value._def.defaultValue() as unknown as T[keyof T]);
      } else if (
        value instanceof ZodString ||
        (value instanceof ZodEffects && value._def.schema instanceof ZodString)
      ) {
        acc[key] = defaultValue ?? ("" as unknown as T[keyof T]);
      } else if (
        value instanceof ZodBoolean ||
        (value instanceof ZodEffects && value._def.schema instanceof ZodBoolean)
      ) {
        acc[key] = defaultValue ?? (false as unknown as T[keyof T]);
      } else if (
        value instanceof ZodNumber ||
        (value instanceof ZodEffects && value._def.schema instanceof ZodNumber)
      ) {
        acc[key] = ((typeof defaultValue === "string"
          ? Number.parseFloat(defaultValue)
          : defaultValue) ?? 0) as T[keyof T];
      } else if (value instanceof ZodNullable) {
        acc[key] = null as T[keyof T];
      }
      return acc;
    },
    {} as T
  );
}

export interface ServerValidationErrorResponse {
  message: string;
  fieldErrors: Map<string, Array<string>>;
}

export function zodServerResolver(
  e: AxiosError,
  form: any /*UseFormReturn<any>*/
) {
  const data = e.response?.data as ServerValidationErrorResponse | undefined;
  if (!data) return;

  if (data.fieldErrors) {
    Object.entries(data.fieldErrors).forEach(([key, value]) => {
      form.setError(key, {
        type: "server",
        message: value[0],
      });
    });
  } else if (data.message) {
    form.setError("root", {
      type: "server",
      message: data.message,
    });
  }
}
