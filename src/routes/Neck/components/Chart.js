import React, { Component, PropTypes } from 'react';
import './styles.scss';
import { Card, Icon, Table, Spin } from 'antd';
import Dimensions from 'react-dimensions';
import TimingChart from './TimingChart';
import IBDecorate from 'immutability';
import GroupList from './GroupList';
import SQLList from './SQLList';
import LazyLoad from 'react-lazy-load';

const columns = [
  {title: 'ApiPath', dataIndex: 'api_path', key: 'api_path', className: 'column'},
  {title: 'Count', dataIndex: 'count', key: 'count', className: 'column', sorter: (a, b) => a.count - b.count},
  {title: 'RequestTimeAvg', dataIndex: 'request_time_avg', key: 'request_time_avg', className: 'column', sorter: (a, b) => a.request_time_avg - b.request_time_avg},
  {title: 'QPSMax', dataIndex: 'qps_max', key: 'qps_max', className: 'column', sorter: (a, b) => a.qps_max - b.qps_max},
  {title: 'QPSAvg', dataIndex: 'qps_avg', key: 'qps_avg', className: 'column', sorter: (a, b) => a.qps_avg - b.qps_avg},
  {title: 'RalCountMax', dataIndex: 'ral_count_max', key: 'ral_count_max', className: 'column', sorter: (a, b) => a.ral_count_max - b.ral_count_max},
  {title: 'RalCountAvg', dataIndex: 'ral_count_avg', key: 'ral_count_avg', className: 'column', sorter: (a, b) => a.ral_count_avg - b.ral_count_avg}
];
@IBDecorate
class Graph extends Component {
  constructor(props) {
    super(props);
    this.handleClick = () => {
      this.setState({
        fold: !this.getState('fold')
      });
    };
  }
  state = {
    fold: true
  };
  // componentWillMount() {
  //   this.cache = lazyCache(this, {
  //     option: {
  //       params: ['data'],
  //       fn: this.initOption
  //     }
  //   });
  // }
  // componentWillReceiveProps(nextProps) {
  //   this.cache.componentWillReceiveProps(nextProps);
  //   this.initGraph();
  // }
    // componentDidMount() {
    //     this.myGraph = echarts.init(findDOMNode(this.graph));
    //     this.myGraph.setOption(this.cache.option);
    //     this.myGraph.on('click', () => {
    //         let newOption = this.initOption(this.props.data);
    //         this.myGraph.setOption(newOption);
    //     });
    // }
  render() {
    return (
      <LazyLoad offsetTop={0} throttle={100} debounce={false}>
        <Card
          bordered={false}
          style={{ height: this.getState('fold') ? 'auto' : '80px' }}
          extra={<Icon onClick={this.handleClick} type={this.getState('fold') ? 'folder-open' : 'folder'} className='smaller' />}
          className={'animated ' + (this.getState('fold') ? 'slideLessRight' : 'slideLessLeft')}
        >
          <Spin spinning={this.props.loading} >
            <span className='graph-title'><Icon className='smaller' type='dot-chart' />{'Chart'}</span>
            <Table
              size='middle'
              columns={columns}
              rowKey='id'
              dataSource={this.props.data}
              className='table'
              style={{marginTop: '30px'}}
              pagination={false}
              expandedRowRender={(e) =>
                <div>
                  <span><b style={{marginLeft: '15px'}}>{'logid : '}</b><b style={{color: '#EEAD0E'}}>{this.props.time[e.id] && this.props.time[e.id].data ? this.props.time[e.id].data.logid : null}</b></span>
                  <TimingChart data={this.props.time[e.id] && this.props.time[e.id].data && this.props.time[e.id].data.raw_chain ? this.props.time[e.id].data.raw_chain : null} loading={this.props.timeLoading} />
                  <GroupList data={this.props.time[e.id] && this.props.time[e.id].data && this.props.time[e.id].data.chain_group ? this.props.time[e.id].data.chain_group : null} />
                  <SQLList data={this.props.time[e.id] && this.props.time[e.id].data && this.props.time[e.id].data.sql_group ? this.props.time[e.id].data.sql_group : null} />
                </div>
            }
              onExpand={(e, r) => e && this.props.getTime({id: r.id})}
            />
          </Spin>
        </Card>
      </ LazyLoad>
    );
  }
}

Graph.propTypes = {
  containerWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  containerHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.object.isRequired
};


export default Dimensions({
  containerStyle: {
    width: '98%',
    height: 'auto',
    marginLeft: '1%',
    marginRight: '1%'
  },
  elementResize: false
})(Graph);
