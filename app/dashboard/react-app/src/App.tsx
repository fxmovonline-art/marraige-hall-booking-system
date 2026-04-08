import { useState } from "react";
import Button from "./components/buttons";
import Alert from "./components/Alert";

function App() {
    const [alertVisible, setAlertVisible] = useState(false);

    return (
        <div>
            {alertVisible && <Alert text="The button is clicked" />}
            <Button color="secondary" onClick={() => setAlertVisible(true)}>Huzaifa</Button>
        </div>
    );
}
export default App;
