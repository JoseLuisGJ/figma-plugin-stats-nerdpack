import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, HeadingText, Spinner, AutoSizer, BillboardChart } from 'nr1';

export default class FigmaPluginStatsVisualization extends React.Component {
    // Custom props you wish to be configurable in the UI must also be defined in
    // the nr1.json file for the visualization. See docs for more details.
    static propTypes = {
        pluginId: PropTypes.number,
        tagSearch: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            _result: null,
            _result2: null,
            like_count: 0,
            unique_run_count: 0
        };
    }

    loadFigmaApi =()=> {
        const { pluginId, tagSearch } = this.props;
        this.doCORSRequest({
            method: 'GET',
            url: `https://www.figma.com/api/feed/plugins?sort_by=all_time&tags=${tagSearch}&pagination=null&editor_type=all&category=null&include_tags=true`,
            data: "empty"
        });
    }

    componentDidMount(){
        this.loadFigmaApi();
    }

    componentDidUpdate(PrevProps, prevState) {
        const { pluginId, tagSearch } = this.props;
        if (tagSearch !== PrevProps.tagSearch) {
            this.loadFigmaApi();
        }
      
    }

    doCORSRequest = (options) => {
        var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
        var x = new XMLHttpRequest();
        x.open(options.method, cors_api_url + options.url);
        x.onload = x.onerror = () => {
            var temp = x.responseText || '';
            this.setState({
                _result: JSON.parse(JSON.stringify(temp))
            });
            this.setState({
                _result2: JSON.parse(this.state._result)
            });
            this.setState({
                isLoaded: true,
            });

            this.setState({
                like_count: this.state._result2.meta.resources[0].like_count,
                unique_run_count: this.state._result2.meta.resources[0].unique_run_count,
            });
        };
        if (/^POST/i.test(options.method)) {
            x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        x.send(options.data);
    }


    render() {



        const { error, isLoaded, items, _result, _result2, unique_run_count, like_count } = this.state;
        const pluginData = [
            {
                metadata: {
                    id: '1',
                    name: 'Installs',
                    viz: 'main',
                },
                data: [{ y: unique_run_count }],
            },
            {
                metadata: {
                    id: '2',
                    name: 'Likes',
                    viz: 'main',
                },
                data: [{ y: like_count }],
            }
        ];

        if (!_result) {
            return <EmptyState />;
        }

        return (<AutoSizer>
            {({ width, height }) => (
                isLoaded ?
                    <Card className="">
                        <CardBody className="">
                            <BillboardChart data={pluginData} />
                        </CardBody>
                    </Card>
                    : <Spinner />
            )}
        </AutoSizer>)
    }
}


const EmptyState = () => (
    <Card className="EmptyState">
        <CardBody className="EmptyState-cardBody">
            <HeadingText
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Please provide either your Figma plugin Id or any custom tag to search for it
            </HeadingText>
        </CardBody>
    </Card>
);

const ErrorState = () => (
    <Card className="ErrorState">
        <CardBody className="ErrorState-cardBody">
            <HeadingText
                className="ErrorState-headingText"
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Oops! Something went wrong.
            </HeadingText>
        </CardBody>
    </Card>
);
