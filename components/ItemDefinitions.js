import { graphql } from 'react-apollo'
import itemdefQuery from '../queries/itemDefinitions'
import { Table, Head, Cell } from './Table'

const ItemDefinitions = ({ data: { itemDefinitions = [] } }) => (
  <Table
    thead={
      <tr>
        <Head>ID</Head>
        <Head>Name</Head>
        <Head>Description</Head>
        <Head>External_Url</Head>
        <Head>Image</Head>
      </tr>
    }
    tbody={itemDefinitions.map(({ id, name, description, external_url, image }) => (
      <tr key={id}>
        <Cell>{id}</Cell>
        <Cell>{name}</Cell>
        <Cell>{description}</Cell>
        <Cell>{external_url}</Cell>
        <Cell><a href={image}>{image}</a></Cell>
      </tr>
    ))}
  />
)

export default graphql(itemdefQuery)(ItemDefinitions)
