import Main from './main'
import {connect} from 'react-redux'

function mapStateToProps(state) {

    return {
        corpus: state.corpus,
        task: state.task
    }

}

const App = connect(mapStateToProps)(Main)

export default App
