import { ValidationError } from 'class-validator';

export function getValidationErrors (errors: ValidationError[]): string {
    if (errors.length === 0) {
        return 'Unknown validation error';
    }

    const firstError = errors[0];
    const { constraints } = firstError;

    if (!constraints) {
        return 'Unknown validation error';
    }

    const firstConstraintKey = Object.keys(constraints)[0];
    return constraints[firstConstraintKey];
}
