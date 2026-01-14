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
    const user = { userId: req.user!.userId, role: req.user!.role };
    const limit = Math.min(query.limit || 10, 10);

    const results = await this.searchService.searchEntities(user.userId, query.q, 1, limit);
    return results;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async fullSearch(@Query() query: SearchQueryDto, @Req() req) {
    const user = { userId: req.user!.userId, role: req.user!.role };

    const page = query.page || 1;
    const limit = query.limit || 20;

    const results = await this.searchService.searchEntities(user.userId, query.q, page, limit);
    return results;
  }
}
