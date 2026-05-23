import { Button } from '@heroui/react';
import { useState } from 'react';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p className="text-white font-bold">{count}</p>
            <Button className="text-white" onPress={() => setCount(count + 1)}>
                Hola Mundo
            </Button>
        </div>
    );
}

export default App;
