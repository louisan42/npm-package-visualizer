import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const TreeContainer = styled.div`
  width: 100%;
  height: 600px;
  overflow: hidden;
  border-radius: 8px;
  background: #fafafa;
  position: relative;
`;

const TreeSvg = styled.svg`
  width: 100%;
  height: 100%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  max-width: 250px;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

function DependencyTree({ data, onNodeClick }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    
    // Clear previous content
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Create tree layout
    const tree = d3.tree()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Convert data to hierarchy
    const root = d3.hierarchy(data, d => d.dependencies);
    
    // Generate tree
    tree(root);

    // Create links
    const links = g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .style('fill', 'none')
      .style('stroke', '#999')
      .style('stroke-width', '2px')
      .style('stroke-opacity', 0.6);

    // Create nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', d => Math.max(8, 20 - d.depth * 2))
      .style('fill', d => {
        if (d.data.error) return '#dc3545';
        if (d.data.circular) return '#fd7e14';
        
        // Color based on vulnerability severity
        if (d.data.vulnerability_count > 0) {
          const severityCounts = d.data.severity_counts || {};
          if (severityCounts.critical > 0) return '#dc3545';
          if (severityCounts.high > 0) return '#fd7e14';
          if (severityCounts.moderate > 0 || severityCounts.medium > 0) return '#ffc107';
          if (severityCounts.low > 0) return '#17a2b8';
        }
        
        return d.depth === 0 ? '#007acc' : '#28a745';
      })
      .style('stroke', '#fff')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        // Highlight connected links
        links.style('stroke-opacity', link => 
          link.source === d || link.target === d ? 1 : 0.2
        );
        
        // Show tooltip with security information
        const securityInfo = d.data.vulnerability_count > 0 
          ? `<br/><span style="color: #ff6b6b;">🚨 ${d.data.vulnerability_count} vulnerabilities</span>
             ${d.data.severity_counts ? Object.entries(d.data.severity_counts)
               .map(([severity, count]) => `<br/>&nbsp;&nbsp;${severity}: ${count}`)
               .join('') : ''}`
          : '<br/><span style="color: #28a745;">✅ No known vulnerabilities</span>';
        
        const tooltipContent = `
          <strong>${d.data.name}</strong><br/>
          Version: ${d.data.version || 'unknown'}<br/>
          ${d.data.description ? `Description: ${d.data.description.substring(0, 100)}...` : ''}
          ${d.data.license ? `<br/>License: ${d.data.license}` : ''}
          ${securityInfo}
          ${d.data.security_score !== undefined ? `<br/>Security Score: ${d.data.security_score}/100` : ''}
          ${d.data.error ? `<br/><span style="color: #ff6b6b;">Error: ${d.data.error}</span>` : ''}
          ${d.data.circular ? '<br/><span style="color: #ffa726;">Circular dependency</span>' : ''}
        `;
        
        tooltip
          .style('opacity', 1)
          .html(tooltipContent)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        // Reset link opacity
        links.style('stroke-opacity', 0.6);
        
        // Hide tooltip
        tooltip.style('opacity', 0);
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        if (onNodeClick && d.data.name) {
          onNodeClick(d.data.name, d.data.version);
        }
      });

    // Add labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -25 : 25)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-size', d => `${Math.max(10, 14 - d.depth)}px`)
      .style('font-weight', d => d.depth === 0 ? 'bold' : 'normal')
      .style('fill', '#333')
      .text(d => {
        const name = d.data.name;
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
      });

    // Add version labels
    nodes.append('text')
      .attr('dy', '1.5em')
      .attr('x', d => d.children ? -25 : 25)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(d => d.data.version ? `v${d.data.version}` : '');

    // Center the tree
    const bounds = g.node().getBBox();
    const fullWidth = width;
    const fullHeight = height;
    const widthScale = fullWidth / bounds.width;
    const heightScale = fullHeight / bounds.height;
    const scale = Math.min(widthScale, heightScale) * 0.8;
    
    const translate = [
      fullWidth / 2 - scale * (bounds.x + bounds.width / 2),
      fullHeight / 2 - scale * (bounds.y + bounds.height / 2)
    ];

    svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

  }, [data, onNodeClick]);

  return (
    <TreeContainer>
      <TreeSvg ref={svgRef} />
      <Tooltip ref={tooltipRef} />
    </TreeContainer>
  );
}

export default DependencyTree;
