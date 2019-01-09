import React from 'react'

/**
 *
 * The basic template for launchable tasks
 *
 */
export default ( { name, action, children } ) => (
    <div className='action'>
        <h4>{name}</h4>
        <div>
            {children}
        </div>
        <div>
            <button onClick={action}>Launch</button>
        </div>
    </div>
)

