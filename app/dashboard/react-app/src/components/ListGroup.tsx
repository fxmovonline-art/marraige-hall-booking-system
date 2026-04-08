import { Fragment, useState } from "react";

interface Props {
    items: string[];
    heading: string;
}

function ListGroup({ items, heading }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    return (
        <Fragment>
            <h1>{heading}</h1>
            {items.length === 0 ? <p>No items found</p> : <ul className="list-group">
                {items.map((item, index) => (
                    <li 
                        key={item} 
                        onClick={() => {
                            setSelectedIndex(index);
                            console.log(item);
                        }} 
                        className={selectedIndex === index ? 'list-group-item active' : 'list-group-item'}
                    >
                        {item}
                    </li>
                ))}
            </ul>}
        </Fragment>
    )
}

export default ListGroup