import Layout from '../components/layout'
import withPage from '../providers/page'
import Uploads from '../components/Uploads'
import ItemDefinitions from '../components/ItemDefinitions'
import ItemInstances from '../components/ItemInstances'

export default withPage(() => (

  <Layout title="Items" page="items">
    <div className="row">
      <div className="col-md-6">
        <div className="container">
          <Uploads />
        </div>
      </div>
      <div className="col-md-4">
        <div className="container">
          <ItemDefinitions />
        </div>
        <div className="container">
          <ItemInstances />
        </div>
      </div>
    </div>

  </Layout>

))
