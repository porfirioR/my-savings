---
name: my-savings project structure
description: Architecture and file layout for the my-savings NestJS + Angular project
type: project
---

The project lives in `c:\Users\porfi\Documents\GitHub\my-savings\`.

## Backend (api/)

Structure is i-design: **host → manager → access**, all flat at `src/` level (NOT per-module subfolders).

```
api/src/
  host/
    controllers/          ← all controllers here
    contracts/
      {entity}/           ← api-request classes (class-validator decorators) + no GroupModel here
    host.module.ts        ← class GroupsHostModule (imports ManagerModule)
  manager/
    services/             ← all manager services here (e.g. groups-manager.service.ts)
    contracts/
      {entity}/           ← request classes + model classes (output)
    manager.module.ts     ← class ManagerModule (imports DataModule)
  access/
    data/
      entities/           ← DB entity interfaces (snake_case columns)
      services/           ← DbContextService, BaseAccessService, all *-access.service.ts
      data.module.ts      ← class DataModule (provides all access services)
    contracts/
      {entity}/           ← access-request classes + access-model classes
  utility/
    constants/
    enums/
    helpers/
    utility.module.ts     ← @Global(), provides DbContextService
  app.module.ts           ← imports ConfigModule, UtilityModule, GroupsHostModule
  main.ts
```

## Naming conventions
- Host input: `{name}-api-request.ts` — class with class-validator decorators + constructor
- Manager input: `{name}-request.ts` — class with constructor
- Access input: `{name}-access-request.ts` — class with constructor
- Manager/Host output: `{name}-model.ts` — class with constructor
- Access output: `{name}-access-model.ts` — class with constructor
- DB entity: `{name}.entity.ts` — interface (snake_case matching DB columns)
- ALL contracts are classes with constructors, NOT interfaces

## Modules
- `host.module.ts` → `GroupsHostModule` — imports ManagerModule, declares all controllers
- `manager.module.ts` → `ManagerModule` — imports DataModule, provides all manager services
- `access/data/data.module.ts` → `DataModule` — provides all access services
- `utility.module.ts` → `UtilityModule` @Global — provides DbContextService

## Frontend (spa/)
- Angular 20, signals, standalone components
- TailwindCSS + DaisyUI
- ngx-translate (assets/i18n/en.json + es.json)
- All UI text in Spanish

## Database
- Supabase (PostgreSQL)
- Tables: groups, members, ruedas, rueda_slots, rueda_monthly_payments, cash_movements, parallel_loans, parallel_loan_payments

**Why:** User corrected structure on 2026-04-05. The correct layout is flat layers at src/ level, not per-entity subfolders.
