import cluster from 'node:cluster'
import * as os from 'node:os'
import { Injectable, Logger } from '@nestjs/common'
import process from 'node:process'

const CLUSTER_DEFAULT_FORKS = os.cpus().length

const DEFAULT_CLUSTER_OPTIONS: AppClusterOptions = {
  name: 'AppClusterService',
  forks: CLUSTER_DEFAULT_FORKS
}

export interface AppClusterOptions {
  name?: string
  forks?: number
  clusterize?: boolean
}

@Injectable()
export class AppClusterService {
  public static async clusterize(callback: () => Promise<void>, options?: AppClusterOptions): Promise<void> {
    options = {
      ...DEFAULT_CLUSTER_OPTIONS,
      ...options,
    }

    if (!options.clusterize) {
      await callback()
      return
    }

    if (cluster.isPrimary) {
      Logger.log(`Master server started on <${process.pid}> with pid <${options.forks}> forks 🏁`, options.name)
      for (let i = 0; i < options.forks; i++) {
        cluster.fork()
      }

      cluster.on('online', (worker) => {
        Logger.log(`Worker ${worker.process['pid']} starting... 🟠`, options.name)
      })

      cluster.on('exit', (worker, code, signal) => {
        Logger.error(`Worker ${worker.process['pid']} died. Restarting`, options.name)
        cluster.fork()
      })
      return
    }

    Logger.log(`Worker server started on pid <${process.pid}> 🟢`, options.name)
    await callback()
  }
}
