import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() userId: string,
    @Body(ValidationPipe) createIncomeDto: CreateIncomeDto,
  ) {
    const incomes = await this.incomesService.create(userId, createIncomeDto);
    return {
      message: createIncomeDto.isRecurring
        ? 'Receitas recorrentes criadas com sucesso'
        : 'Receita criada com sucesso',
      data: incomes,
    };
  }

  @Get('stats')
  async getStats(
    @CurrentUser() userId: string,
    @Query('period')
    period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.incomesService.getStats(
      userId,
      period,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return { data: stats };
  }

  @Get()
  async findAll(
    @CurrentUser() userId: string,
    @Query('period')
    period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
  ) {
    if (period) {
      const incomes = await this.incomesService.findByPeriod(userId, period);
      return { data: incomes };
    }
    const incomes = await this.incomesService.findAll(userId);
    return { data: incomes };
  }

  @Get('latest-transactions')
  async getLatestTransactions(
    @CurrentUser() userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const transactions = await this.incomesService.getLatestTransactions(
      userId,
      limitNumber,
    );
    return { data: transactions };
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('description') description?: string,
    @Query('period') period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('type') type?: 'income' | 'expense',
  ) {
    const transactions = await this.incomesService.getTransactions(
      userId,
      {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        category,
        minAmount: minAmount ? parseInt(minAmount, 10) : undefined,
        maxAmount: maxAmount ? parseInt(maxAmount, 10) : undefined,
        description,
        period,
        month: month ? parseInt(month, 10) : undefined,
        year: year ? parseInt(year, 10) : undefined,
        type,
      },
    );
    return { data: transactions };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    const income = await this.incomesService.findOne(id, userId);
    return { data: income };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body(ValidationPipe) updateIncomeDto: UpdateIncomeDto,
  ) {
    const income = await this.incomesService.update(
      id,
      userId,
      updateIncomeDto,
    );
    return {
      message: 'Receita atualizada com sucesso',
      data: income,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() userId: string) {
    await this.incomesService.remove(id, userId);
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @CurrentUser() userId: string,
  ) {
    const incomes = await this.incomesService.findByCategory(userId, category);
    return { data: incomes };
  }

}
