  import { Controller, Get, Param, Post, Body, Put, UseGuards } from '@nestjs/common';
import { EventModel } from '../../manager/models/events/event-model';
import { UpdateEventRequest } from '../../manager/models/events/update-event-request';
import { EventManagerService } from '../../manager/services';
import { CreateEventApiRequest } from '../models/events/create-event-api-request';
import { UpdateEventApiRequest } from '../models/events/update-event-api-request';
import { PrivateEndpointGuard } from '../guards/private-endpoint.guard';
  
  @Controller('events')
  export class EventsController {
    constructor(private eventManagerService: EventManagerService) {}

    @Get()
    async getPublicEvents(): Promise<EventModel[]> {
      return await this.eventManagerService.getPublicEvents();
    }

    @Get(':id')
    @UseGuards(PrivateEndpointGuard)
    async getMyEvents(@Param('id') id: number): Promise<EventModel[]> {
      return await this.eventManagerService.getMyEvents(id);
    }

    @Get('follow/:id')
    @UseGuards(PrivateEndpointGuard)
    async getMyEventFollows(@Param('id') id: number): Promise<EventModel[]> {
      return await this.eventManagerService.getMyEventFollows(id);
    }

    @Post()
    @UseGuards(PrivateEndpointGuard)
    async createEvent(@Body() apiRequest: CreateEventApiRequest): Promise<EventModel> {
      return await this.eventManagerService.createEvent(apiRequest);
    }

    @Put()
    @UseGuards(PrivateEndpointGuard)
    async updateEvent(@Body() apiRequest: UpdateEventApiRequest): Promise<EventModel> {
      const request = new UpdateEventRequest(apiRequest.id, apiRequest.name, apiRequest.description, apiRequest.date, apiRequest.isPublic)
      return await this.eventManagerService.updateEvent(request);
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

