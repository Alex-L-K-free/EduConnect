import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Обновляем состояние, чтобы следующий рендер показал запасной интерфейс
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Можно также сохранить информацию об ошибке в журнале
        console.error("Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Запасной интерфейс
            return <h1>Что-то пошло не так.</h1>;
        }

        return this.props.children; 
    }
}

export default ErrorBoundary; 