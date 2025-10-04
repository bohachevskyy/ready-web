import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from './store/counterSlice';
import './App.css';

function App() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Ready Web App
        </h1>
        <div className="text-center">
          <p className="text-xl mb-4">Count: <span className="font-bold text-blue-600">{count}</span></p>
          <div className="space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => dispatch(increment())}
            >
              +
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => dispatch(decrement())}
            >
              -
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => dispatch(incrementByAmount(5))}
            >
              +5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
