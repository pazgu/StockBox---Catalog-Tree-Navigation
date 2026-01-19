/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dtos/searchQuery.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('dropdown')
  @UseGuards(AuthGuard('jwt'))
  async dropdown(@Query() query: SearchQueryDto, @Req() req) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const limit = Math.min(query.limit ?? 10, 10);
    return this.searchService.searchEntities(
      userId,
      query.q,
      1,
      limit,
      userRole,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async fullSearch(@Query() query: SearchQueryDto, @Req() req) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const userRole = req.user.role;
    return this.searchService.searchEntities(
      req.user.userId,
      query.q,
      page,
      limit,
      userRole,
    );
  }
}
