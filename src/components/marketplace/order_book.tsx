import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { getOrderBook, getSelectedToken } from '../../store/selectors';
import { themeColors } from '../../util/theme';
import { tokenAmountInUnits } from '../../util/tokens';
import { OrderBook, OrderBookItem, StoreState, TabItem, Token, UIOrderSide } from '../../util/types';
import { Card } from '../common/card';
import { CardTabSelector } from '../common/card_tab_selector';
import { CardLoading } from '../common/loading';
import { CustomTD, CustomTDLast, CustomTDTitle, Table, TH, THead, THLast, TR } from '../common/table';

interface StateProps {
    orderBook: OrderBook;
    selectedToken: Token | null;
}

type Props = StateProps;

enum Tab {
    Current,
    History,
}

interface State {
    tab: Tab;
}

const NoOrders = styled.div`
    padding: 10px 18px;
`;

const orderToRow = (order: OrderBookItem, index: number, count: number, selectedToken: Token) => {
    const size = tokenAmountInUnits(order.size, selectedToken.decimals);
    const price = order.price.toString();
    const priceColor = order.side === UIOrderSide.Buy ? themeColors.orange : themeColors.green;
    const time: string = '';
    const timeColor = time ? '#000' : themeColors.lightGray;

    return (
        <TR key={index}>
            <CustomTD styles={{ textAlign: 'right' }}>{size}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', color: priceColor }}>{price}</CustomTD>
            <CustomTDLast styles={{ textAlign: 'right', color: timeColor }}>{time.length ? time : '-'}</CustomTDLast>
        </TR>
    );
};

class OrderBookTable extends React.Component<Props, State> {
    public state = {
        tab: Tab.Current,
    };

    public render = () => {
        const { orderBook, selectedToken } = this.props;
        const { sellOrders, buyOrders, spread } = orderBook;

        const setTabCurrent = () => this.setState({ tab: Tab.Current });
        const setTabHistory = () => this.setState({ tab: Tab.History });

        const cardTabs: TabItem[] = [
            {
                active: this.state.tab === Tab.Current,
                onClick: setTabCurrent,
                text: 'Current',
            },
            {
                active: this.state.tab === Tab.History,
                onClick: setTabHistory,
                text: 'History',
            },
        ];

        let content: React.ReactNode;

        if (!selectedToken) {
            content = <CardLoading />;
        } else if (!buyOrders.length && !sellOrders.length) {
            content = <NoOrders>There are no orders to show</NoOrders>;
        } else {
            content = (
                <Table fitInCard={true}>
                    <THead>
                        <TR>
                            <TH styles={{ textAlign: 'right', borderBottom: true }}>Trade size</TH>
                            <TH styles={{ textAlign: 'right', borderBottom: true }}>Price (ETH)</TH>
                            <THLast styles={{ textAlign: 'right', borderBottom: true }}>Time</THLast>
                        </TR>
                    </THead>
                    <tbody>
                        {sellOrders.map((order, index) => orderToRow(order, index, sellOrders.length, selectedToken))}
                        <TR>
                            <CustomTDTitle styles={{ textAlign: 'right', borderBottom: true, borderTop: true }}>
                                Spread
                            </CustomTDTitle>
                            <CustomTD styles={{ textAlign: 'right', borderBottom: true, borderTop: true }}>
                                {spread.toFixed(2)}
                            </CustomTD>
                            <CustomTDLast styles={{ textAlign: 'right', borderBottom: true, borderTop: true }}>
                                {}
                            </CustomTDLast>
                        </TR>
                        {buyOrders.map((order, index) => orderToRow(order, index, buyOrders.length, selectedToken))}
                    </tbody>
                </Table>
            );
        }

        return (
            <Card title="Orderbook" action={<CardTabSelector tabs={cardTabs} />}>
                {content}
            </Card>
        );
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        orderBook: getOrderBook(state),
        selectedToken: getSelectedToken(state),
    };
};

const OrderBookTableContainer = connect(mapStateToProps)(OrderBookTable);

export { OrderBookTable, OrderBookTableContainer };
