  import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { EventModel } from '../../manager/models/events/event-model';
import { EventManagerService } from '../../manager/services';
import { CreateEventApiRequest } from '../models/events/create-event-api-request';
import { UpdateEventApiRequest } from '../models/events/update-event-api-request';
  
  @Controller()
  export class EventController {
    constructor(private eventManagerService: EventManagerService) {}

    @Get()
    async getPublicEvents(): Promise<EventModel[]> {
      return await this.eventManagerService.getPublicEvents();
    }

    @Get(':id')
    async getMyEvents(@Param('id') id: number): Promise<EventModel[]> {
      return await this.eventManagerService.getMyEvents(id);
    }

    @Post()
    async createEvent(@Body() apiRequest: CreateEventApiRequest): Promise<EventModel> {
      return await this.eventManagerService.createEvent(apiRequest);
    }

    @Put()
    async updateEvent(@Body() apiRequest: UpdateEventApiRequest): Promise<EventModel> {
      return await this.eventManagerService.updateEvent(apiRequest);
    }

    // /**
    //   * Delete Event By Id
    //   * @param id
    //   */
    // @Delete()
    // deleteClassName_singular(@Param('id') id: string) {
    //   this.eventManagerService.deleteClassName_singular(id);
    // }
  }

