import React from 'react'
import Task from './task'
import {fetchFreqlist} from '../../redux/actions'

const launch = (dispatch, corpus) => {
    dispatch(fetchFreqlist(
        {
            type: 'frequencylist'
        },
        corpus
    ))
}


export default  ( {corpus, dispatch} ) => {

    return (

        <Task name={'Frequency list'} action={launch.bind(null, dispatch, corpus)} >

        Frequency lists are... Well, you know what they are.

        </Task>
    )

}
