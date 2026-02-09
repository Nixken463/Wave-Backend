import type Database from 'src/utils/database'

export type Env = {
  Variables: {
    db: Database
  }
}