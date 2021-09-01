import * as path from 'path'
import moduleAlias from 'module-alias'

const files = path.resolve(__dirname, '../..')

moduleAlias.addAliases({
    '@source': path.join(files, 'src'),
    '@test': path.join(files, 'test')
})