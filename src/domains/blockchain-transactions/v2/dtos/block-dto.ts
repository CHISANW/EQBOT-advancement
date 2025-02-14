import { IsOptional, Min } from 'class-validator';

export class BlockDto {
    @IsOptional()
    amount: string;

    @IsOptional()
    iteration: number;

    @IsOptional()
    groupId: number;

    @IsOptional()
    @Min(4)
    accountCount: number;

    private constructor(amount?: string, iteration?: number, groupId?: number, count?: number) {
        this.amount = amount ?? '100';
        this.iteration = iteration ?? 100;
        this.groupId = groupId ?? 0;
        this.accountCount = count ?? 10;
    }

    static of(amount: string, iteration: number, groupId: number, count: number): BlockDto {
        return new BlockDto(amount, iteration, groupId, count);
    }

    static init() {
        return new BlockDto();
    }
}
